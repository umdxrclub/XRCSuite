import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { InteractionHandler } from "../interactions/interactions";
import { LabCommand } from "./Lab";
import { PollCommand } from "./Poll";
import { BirthdayCommand } from "./Birthday";
import { EventsCommand } from "./Events";
import { ExecCommand } from "./Exec";
import { LinkCommand } from "./Link";
import { RolesCommand } from "./Roles";

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