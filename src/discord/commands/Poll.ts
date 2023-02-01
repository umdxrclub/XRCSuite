import { EmbedBuilder, RGBTuple } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, CommandInteraction, Interaction, ModalBuilder, SlashCommandBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import payload from "payload";
import { CollectionSlugs } from "../../slugs";
import { Poll } from "../../types/PayloadSchema";
import { getDiscordClient } from "../bot";
import { Command } from "./command";

const PollRegex = /POLL-([a-g0-9]{24})-(\d+)/;
const PollModalId = "CreatePoll";
const DisplayPollId = "DisplayPoll";
const EndPollId = "DeletePoll";

async function getOpenPolls(discordId: string) {
    return await payload.find({
        collection: CollectionSlugs.Polls,
        where: {
            and: [
                {
                    author: {
                        equals: discordId
                    }
                },
                {
                    open: {
                        equals: true
                    }
                }
            ]
        }
    })
}

function createPollSelectableMenu(polls: Poll[], customId: string) {
    return new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(customId)
                            .setPlaceholder('No poll selected')
                            .addOptions(
                                polls.map(p => ({
                                    label: p.title,
                                    value: p.id
                                }))
                            )
                    )
}
async function onPollInvoke(interaction: ChatInputCommandInteraction<CacheType>) {
    let user = interaction.user;

    let subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
        case "create":
            let modal = new ModalBuilder()
                .setCustomId(PollModalId)
                .setTitle('Create Poll')

            let pollTitleInput = new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Poll Title')
                .setStyle(TextInputStyle.Short)

            let choices: TextInputBuilder[] = []
            for (var i = 1; i <= 4; i++) {
                choices.push(new TextInputBuilder()
                    .setCustomId('choice-'+i)
                    .setLabel("Choice #"+i)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(i <= 2)
                )
            }

            let builders = [pollTitleInput, ...choices]
            let rows = builders.map(b => new ActionRowBuilder<TextInputBuilder>().addComponents(b))

            modal.addComponents(...rows)

            await interaction.showModal(modal)
            break;
        case "end":
        case "display":
            let openPolls = await getOpenPolls(user.id);

            if (openPolls.totalDocs > 0) {
                let row = createPollSelectableMenu(openPolls.docs, subcommand == "display" ? DisplayPollId : EndPollId)
                let text = subcommand == "display"
                    ? "Choose a poll to display."
                    : "Choose a poll to end.";

                await interaction.reply({ content: text, components: [row], ephemeral: true })
            } else {
                await interaction.reply({ content: "You have no current polls.", ephemeral: true })
            }
            break;
    }
}

async function onInteractionCreate(interaction: Interaction<CacheType>) {
    let user = interaction.user;

    if (interaction.isModalSubmit() && interaction.customId == PollModalId) {
        // Create a poll from modal answers
        let title = interaction.fields.getTextInputValue("title")
        let choices = []

        for (var i = 1; i <= 4; i++) {
            let option = interaction.fields.getTextInputValue(`choice-${i}`);
            if (option != "") {
                choices.push(option)
            }
        }

        let reply = await interaction.reply({content: "Loading Poll...", fetchReply: true})
        let replyId = reply.id;

        // Create the poll
        await payload.create({
            collection: CollectionSlugs.Polls,
            data: {
                title: title,
                author: user.id,
                messages: [
                    {
                        channel: interaction.channelId,
                        msg: replyId
                    }
                ],
                choices: choices.map(s => ({
                    name: s,
                    count: 0,
                    voters: []
                }))
            }
        })
    } else if (interaction.isButton()) {
        // The poll information is encoded in the custom id of the button. Therefore,
        // determine if this button interaction originated from a poll by testing
        // its custom id against the PollRegex.
        let customId = interaction.customId;
        let match = PollRegex.exec(customId)
        if (match) {
            // Extract the poll id and choice from the regex match.
            let pollId = match[1]
            let choiceNumber = match[2]

            // Attempt to fetch the poll.
            var poll: Poll | undefined = undefined;
            try {
                poll = await payload.findByID<Poll>({
                    collection: CollectionSlugs.Polls,
                    id: pollId
                })
            } catch {
                await interaction.reply({ content: "This poll no longer exists!", ephemeral: true })
                return;
            }

            if (poll) {
                let choices = poll.choices;
                let choice = poll.choices[choiceNumber];

                if (poll.allowRevote) {
                    // Remove all of their previous votes
                    choices.forEach(c => c.voters = c.voters.filter(v => v.id != user.id))
                } else if (choices.some(c => c.voters.some(v => v.id == user.id))) {
                    // If here, a user has already voted for another option.
                    await interaction.reply({ content: "You have already voted on this poll!", ephemeral: true })
                    return;
                }

                // Add voter
                choice.voters.push({ id: interaction.user.id })

                // Update poll
                await payload.update<Poll>({
                    collection: CollectionSlugs.Polls,
                    id: pollId,
                    data: {
                        choices: choices
                    }
                })

                await interaction.reply({ content: "Your vote has been counted!", ephemeral: true })
            }
        }
    } else if (interaction.isStringSelectMenu()) {
        let pollId = interaction.values[0];

        switch (interaction.customId) {
            case DisplayPollId:
                let reply = await interaction.reply({content: "Loading Poll...", fetchReply: true})
                let replyId = reply.id;

                let poll = await payload.findByID({
                    collection: CollectionSlugs.Polls,
                    id: pollId
                })

                // Add the new poll to the messages.
                let messages = poll.messages;
                messages.push({
                    channel: interaction.channelId,
                    msg: replyId
                })

                // Update poll with new message.
                await payload.update({
                    collection: CollectionSlugs.Polls,
                    id: pollId,
                    data: {
                        messages: messages
                    }
                })
                break;

            case EndPollId:
                // Close the poll.
                await payload.update({
                    collection: CollectionSlugs.Polls,
                    id: pollId,
                    data: {
                        open: false
                    }
                })

                await interaction.reply({ content: "Your poll has been closed!" , ephemeral: true })
                break;
        }
    }
}

/**
 * The poll command allows users to create polls that other club members can
 * vote on.
 */
export const PollCommand: Command = {
    onInvoke: onPollInvoke,
    onInteractionCreate: onInteractionCreate,
    data: new SlashCommandBuilder()
     .setName("poll")
     .setDescription("Allows you to create polls that other club members can vote on.")
     .addSubcommand((subcommand) =>
        subcommand
        .setName("create")
        .setDescription("Creates a poll that other members can vote on.")
     )
    .addSubcommand(subcommand =>
        subcommand
        .setName("display")
        .setDescription("Displays a poll that you have already created.")
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("end")
        .setDescription("Ends a poll that you have created.")
    )
}