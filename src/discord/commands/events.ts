import { ActionRowBuilder, CacheType, ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import payload from "payload";
import { Command } from "./command";

const EventAnnounceId = "EventAnnounce";

async function onEventsInvoke(
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
    switch (interaction.options.getSubcommand()) {
        case "announce":
            // let channel = interaction.options.getChannel("channel")
            // var textChannel: TextChannel | undefined
            // if (channel) {
            //     textChannel = (await interaction.client.channels.resolve(channel.id)) as TextChannel
            // }

            let events = await payload.find({
                collection: "events",
                where: {
                    startDate: {
                        greater_than_equal: new Date()
                    }
                }
            })

            let options = events.docs.map(event => ({
                label: event.name,
                value: event.id
            }))

            let row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(new StringSelectMenuBuilder()
                    .setCustomId(EventAnnounceId)
                    .setPlaceholder("No event selected")
                    .addOptions(options)
                )

            await interaction.reply({ content: "Choose an event to announce:", components: [row], ephemeral: true })
            break;
    }
}

export const EventsCommand: Command = {
    onInvoke: onEventsInvoke,
    leadershipOnly: true,
    data: new SlashCommandBuilder()
        .setName("events")
        .setDescription("Manages events for the XR Club.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("announce")
                .setDescription("Announces an event in the events channel or a specified channel.")
                .addChannelOption(option => option
                    .setName("channel")
                    .setDescription("The channel to announce the event in. If unspecified, the events channel is used.")
                    .addChannelTypes(ChannelType.GuildText)
                )
        )
}