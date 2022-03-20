import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction } from "discord.js";
import { Command } from "./command";

async function onMentorInvoke(interaction: CommandInteraction<CacheType>) {
    switch (interaction.options.getSubcommand()) {
        case "list": // List all headsets available to select.
        case "request": // Adds a headset role to the user.
            break;
    }
}

export const mentor: Command = {
    onInvoke: onMentorInvoke,
    data: new SlashCommandBuilder()
        .setName("mentor")
        .setDescription("Manages mentors and their office hours.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("List all mentors and their availability.")
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("request")
                .setDescription("Request a mentor with a short description of your problem.")
                .addStringOption(option =>
                    option
                        .setName("problem-description")
                        .setDescription("A small description of a problem your dealing with, the topic you want to discuss, etc.")
                        .setRequired(true)
                    )
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("checkin")
                .setDescription("Marks you as available for live assistance/office hours.")
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("checkout")
                .setDescription("Marks you as unavailable for live assistance/office hours.")
            )
}