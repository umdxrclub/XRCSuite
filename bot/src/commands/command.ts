import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction } from "discord.js";
import { mentor } from "./mentor";
import { link } from "./link";

/**
 * A structure for creating slash commands.
 */
export interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder,
    onInvoke: (interaction: CommandInteraction<CacheType>) => Promise<void>
}

/**
 * All commands that the bot will register and process.
 */
export const BOT_COMMANDS: Command[] = [
    link, //mentor
]