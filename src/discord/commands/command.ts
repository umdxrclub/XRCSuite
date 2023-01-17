import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CacheType, ChatInputCommandInteraction, Interaction } from "discord.js";
import { Member } from "../../types/PayloadSchema";
import { BirthdayCommand } from "./birthday";
import { EventsCommand } from "./events";
import { LabCommand } from "./Lab";
import { LinkCommand } from "./link";
import { PollCommand } from "./Poll";
import { RolesCommand } from "./roles";

/**
 * A structure for creating slash commands.
 */
export interface Command {
    leadershipOnly?: boolean | Member["leadershipRoles"]
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder,
    onInvoke: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>,
    onInteractionCreate?: (interaction: Interaction<CacheType>) => Promise<void>
}

/**
 * All commands that the bot will register and process.
 */
export const BotCommands: Command[] = [
    LinkCommand, RolesCommand, PollCommand, EventsCommand, LabCommand, BirthdayCommand
]