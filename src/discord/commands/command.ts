import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CacheType, ChatInputCommandInteraction, Interaction } from "discord.js";
import { InteractionHandler } from "../interactions/interactions";
import { BirthdayCommand } from "./birthday";
import { EventsCommand } from "./events";
import { ExecCommand } from "./exec";
import { LabCommand } from "./Lab";
import { LinkCommand } from "./link";
import { PollCommand } from "./Poll";
import { RolesCommand } from "./roles";

type CommandData = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">

/**
 * A structure for creating slash commands.
 */
export interface Command {
    leadershipOnly?: boolean
    data: CommandData,
    onInvoke: (interaction: ChatInputCommandInteraction<CacheType>) => void,
    onInteractionCreate?: InteractionHandler
}

/**
 * All commands that the bot will register and process.
 */
export const BotCommands: Command[] = [
    LinkCommand, RolesCommand, PollCommand, EventsCommand, LabCommand, BirthdayCommand, ExecCommand
]