import { ActionRowBuilder, CacheType, ChatInputCommandInteraction, Interaction, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { getMemberFromDiscordId } from "../../collections/util/MembersUtil";
import { Command } from "./command";

const BirthdayModalId = "BirthdayModal"
const BirthdayRegex = /\d{1,2}\/\d{1,2}\/\d{4}/

async function onBirthdayInvoke(interaction: ChatInputCommandInteraction<CacheType>) {
    let user = interaction.user;
    let member = await getMemberFromDiscordId(user.id);

    if (member) {
        if (member.birthday) {
            await interaction.reply({ content: "You have already set a birthday!", ephemeral: true })
        } else {
            let modal = new ModalBuilder()
                .setCustomId(BirthdayModalId)
                .setTitle("When's your birthday?")

            // Add the birthday field
            let row = new ActionRowBuilder<TextInputBuilder>()
                .addComponents(new TextInputBuilder()
                    .setLabel("Your Birthday (MM/DD/YYYY)")
                    .setCustomId("birthday")
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(8)
                    .setMaxLength(10)
                    .setPlaceholder("11/6/2022") // I wonder if anyone will get this reference :)
            )

            // Add birthday field to modal
            modal.addComponents(row);

            await interaction.showModal(modal)
        }
    } else {
        await interaction.reply({ content: "Oh no! You are currently not registered with the club so we can't add your birthday!", ephemeral: true })
    }
}

async function onInteractionCreate(interaction: Interaction<CacheType>) {
    if (interaction.isModalSubmit() && interaction.customId === BirthdayModalId) {
        await interaction.reply({ content: "Are you sure?", ephemeral: true })
    }
}

export const BirthdayCommand: Command = {
    onInvoke: onBirthdayInvoke,
    onInteractionCreate: onInteractionCreate,
    data: new SlashCommandBuilder()
        .setName("birthday")
        .setDescription("Allows you to register your birthday so that we can celebrate your special day!")
}