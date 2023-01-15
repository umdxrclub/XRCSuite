import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CacheType, ChatInputCommandInteraction, Interaction } from "discord.js";
import { Birthday } from "./birthday";
import { Events } from "./events";
import { Lab } from "./Lab";
import { link } from "./link";
import { Poll } from "./Poll";
import { Roles } from "./roles";

/**
 * A structure for creating slash commands.
 */
export interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder,
    onInvoke: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>,
    onInteractionCreate?: (interaction: Interaction<CacheType>) => Promise<void>
}

/**
 * All commands that the bot will register and process.
 */
export const BotCommands: Command[] = [
    link, Roles, Poll, Events, Lab, Birthday
]