import {
    MessageCreateOptions,
    MessagePayload,
    REST,
    RESTPostAPIApplicationCommandsJSONBody,
    Routes,
    TextChannel
} from "discord.js";
import payload from "payload";
import { AnnouncementChannelType } from "../data/XRCTypes";
import { GlobalSlugs } from "../slugs";
import { getDiscordClient } from "./bot";
import { BotCommands } from "./commands/command";

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

export async function getGuild() {
    let client = getDiscordClient();

    let { guild } = await payload.findGlobal({
        slug: GlobalSlugs.Discord
    })

    return client.guilds.resolve(guild.guildId)
}

export async function registerCommands() {
    let client = await getDiscordClient();
    let discordConfig = await payload.findGlobal({
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

        let { guild } = await payload.findGlobal({
            slug: GlobalSlugs.Discord,
        });

        let clientId = discordConfig.auth.clientId

        // Add commands to all servers.
        let guildId = guild.guildId;
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        )
    }
}

