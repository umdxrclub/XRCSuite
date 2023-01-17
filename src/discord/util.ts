import {
    MessageCreateOptions,
    MessagePayload,
    REST,
    RESTPostAPIApplicationCommandsJSONBody,
    Routes,
    TextChannel,
    Guild,
    ChatInputCommandInteraction,
    CacheType
} from "discord.js";
import payload from "payload";
import { AnnouncementChannelType } from "../types/XRCTypes";
import { GlobalSlugs } from "../slugs";
import { getDiscordClient } from "./bot";
import { BotCommands } from "./commands/command";
import { Bot } from "../types/PayloadSchema";
import { isDiscordMemberLeadership } from "../collections/util/MembersUtil";

/**
 * Sends a message to the specified announcement channel of all registered
 * guilds.
 *
 * @param channel The type of channel to send the message to
 * @param content The message content
 */
export async function sendGuildMessage (
  channel: AnnouncementChannelType,
  content: string | MessagePayload | MessageCreateOptions
) {
    // First retrieve discord client
    let client = await getDiscordClient();

    // Ensure that the Discord client exists.
    if (client) {
        let { guild } = await payload.findGlobal({
            slug: GlobalSlugs.Discord
        });

        let channelId: string | undefined = guild.channels[channel];

        // Check to see that a channel was successfully retrieved.
        if (channelId) {
            let channel = await client.channels.fetch(channelId);
            if (channel && channel instanceof TextChannel) {
                await channel.send(content);
            }
        }
    }
}

/**
 * Fetches the Guild that is currently specified within Payload.
 *
 * @returns The current Discord guild.
 */
export async function getGuild(): Promise<Guild | undefined> {
    let client = getDiscordClient();

    let { guild } = await payload.findGlobal<Bot>({
        slug: GlobalSlugs.Discord
    })

    if (guild.guildId) {
        return client.guilds.resolve(guild.guildId)
    } else {
        return undefined;
    }
}

/**
 * Registers all slash commands specified within the BotCommands list for the
 * currently configured guild in Payload.
 */
export async function registerCommands() {
    let client = await getDiscordClient();
    let discordConfig = await payload.findGlobal<Bot>({
        slug: GlobalSlugs.Discord
    })

    if (client && discordConfig) {
        // Create the REST handler.
        const rest = new REST({ version: '9' }).setToken(client.token);

        // Create the JSON body for each command.
        var commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        BotCommands.forEach((command) => {
            commands.push(command.data.toJSON());
        });

        let clientId = discordConfig.auth.clientId

        // Add commands to all servers.
        let guildId = discordConfig.guild.guildId;
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        )
    }
}

/**
 * Verifies that an interaction's user has leadership privilege, and if they don't,
 * reply with an interaction saying they don't have permission.
 *
 * @param interaction The interaction to verify
 * @returns Whether the interaction was rejected
 */
export async function rejectInteractionIfNotLeadership(interaction: ChatInputCommandInteraction<CacheType>): Promise<boolean> {
    if (await isDiscordMemberLeadership(interaction.user.id)) {
        return false;
    }

    await interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true })
    return true;
}