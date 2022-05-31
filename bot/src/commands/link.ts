import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { Command } from "./command";

async function onLinkInvoke(interaction: CommandInteraction<CacheType>) {
    switch (interaction.options.getSubcommand()) {
        case "umd": 
            // Send verification information.
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel("Verify you're a UMD student")
                        .setStyle("LINK")
                        .setURL("https://google.com")
                )
            await interaction.reply({ content: "Click the following button to verify your UID",
                components: [row], ephemeral: true })

            // Await verification.
            // let uid = await verification.promise;
            let uid = "ABCDEF";

            // Send successful verification.
            await interaction.followUp({ content: "You are " + uid , ephemeral: true })
    }
}

export const link: Command = {
    onInvoke: onLinkInvoke,
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Manages the association of third-party services/accounts to your Discord account")
        .addSubcommand(subcommand =>
            subcommand
                .setName("umd")
                .setDescription("Allows you to connect your UMD id to your Discord account."))
        .addSubcommand(subcommand =>
            subcommand
                .setName("scoresaber")
                .setDescription("Allows you to connect your ScoreSaber profile to your Discord account.")
                .addStringOption(option =>
                    option
                        .setName("id")
                        .setDescription("Your ScoreSaber id.")
                        .setRequired(true)))
}