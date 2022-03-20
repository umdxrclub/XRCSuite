import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction } from "discord.js";
import { HEADSET_ROLES } from "../headset_roles";
import { Command } from "./command";

async function onHeadsetInvoke(interaction: CommandInteraction<CacheType>) {
    switch (interaction.options.getSubcommand()) {
        case "list": // List all headsets available to select.
            var msg = ""
            HEADSET_ROLES.vendors.forEach(vendor => {
                msg += `**${vendor.name}**\n`;
                vendor.headsets.forEach(headset => {
                    msg += `\t${headset.name} ${headset.discontinued ? "(discontinued)" : ""}\n`
                });
                msg += "\n";
            });

            await interaction.reply({ content: msg, ephemeral: true });
            break;
        case "add": // Adds a headset role to the user.
            break;
    }
}

export const headset: Command = {
    onInvoke: onHeadsetInvoke,
    data: new SlashCommandBuilder()
        .setName("headset")
        .setDescription("Manages all headset roles.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("List all headsets available.")
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Adds a headset role to you.")
                .addStringOption(option =>
                    option
                        .setName("headset-name")
                        .setDescription("Name of the headset you're trying to add. Use '/headset list' to get a list of headsets.")
                        .setRequired(true)
                )
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("Removes a headset role from you.")
                .addStringOption(option =>
                    option
                        .setName("headset-name")
                        .setDescription("Name of the headset you're trying to remove. Use '/headset list' to get a list of headsets.")
                        .setRequired(true)
                )
            )
}