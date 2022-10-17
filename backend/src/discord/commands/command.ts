import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { announce } from "./announce";
import { link } from "./link";

/**
 * A structure for creating slash commands.
 */
export interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder,
    onInvoke: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>
}

/**
 * All commands that the bot will register and process.
 */
export const BOT_COMMANDS: Command[] = [
    link, announce
]