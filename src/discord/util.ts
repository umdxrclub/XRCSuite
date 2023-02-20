import {
    ActionRowBuilder, AttachmentBuilder, ButtonBuilder,
    ButtonStyle, CacheType, ChatInputCommandInteraction, Guild, GuildBasedChannel, Message, MessageCreateOptions,
    MessagePayload, NewsChannel, REST,
    RESTPostAPIApplicationCommandsJSONBody,
    Routes,
    TextChannel
} from "discord.js";
import path from "path";
import payload from "payload";
import { MediaDirectory } from "../collections/Media";
import { isDiscordMemberLeadership } from "../collections/util/MembersUtil";
import { Media } from "../types/PayloadSchema";
import { XRCSuiteChannelType } from "../types/XRCTypes";
import { resolveDocument } from "../util/payload-backend";
import { Throttle } from "../util/throttle";
import { getDiscordClient } from "./bot";
import { BotCommands } from "./commands/command";

export type DiscordMessage = string | MessagePayload | MessageCreateOptions

/**
 * Sends a message to the specified announcement channel of all registered
 * guilds.
 *
 * @param channelType The type of channel to send the message to
 * @param content The message content
 */
export async function sendGuildMessage (
  channelType: XRCSuiteChannelType,
  content: DiscordMessage
): Promise<Message | undefined> {
    let channel = await getGuildChannel(channelType);

    if (channel && (channel instanceof TextChannel || channel instanceof NewsChannel)) {
        return await channel.send(content);
    }
}

/**
 * Fetches the Guild that is currently specified within Payload.
 *
 * @returns The current Discord guild.
 */
export async function getGuild(): Promise<Guild | null> {
    let client = getDiscordClient();

    let { guild } = await payload.findGlobal({
        slug: "bot"
    })

    if (guild.guildId) {
        return await client.guilds.fetch(guild.guildId)
    } else {
        return null;
    }
}

export async function getGuildChannel(channelType: XRCSuiteChannelType): Promise<GuildBasedChannel | null>{
    let { guild } = await payload.findGlobal({
        slug: "bot"
    });

    let channelId: string | undefined = guild.channels[channelType];

    // Check to see that a channel was successfully retrieved.
    if (channelId) {
        let channel = await getGuildChannelById(channelId);
        return channel;
    }

    return null;
}

export async function getGuildChannelById(channelId: string): Promise<GuildBasedChannel | null> {
    let guild = await getGuild();
    if (guild) {
        let channel = await guild.channels.fetch(channelId)
        return channel;
    }

    return null;
}

export async function getGuildRole(roleId: string) {
    let guild = await getGuild()
    if (guild) {
        let role = await guild.roles.resolve(roleId)
        if (role) {
            return role;
        }
    }

    return null;
}

/**
 * Registers all slash commands specified within the BotCommands list for the
 * currently configured guild in Payload.
 */
export async function registerCommands() {
    let client = await getDiscordClient();
    let discordConfig = await payload.findGlobal({
        slug: "bot"
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

/**
 * Creates an attachment that can be included in a message/embed from some
 * Payload media.
 *
 * @param media The media to create an attachment from
 * @returns An attachment builder and url
 */
export async function createAttachmentFromMedia(media: Media | string) {
    let resolvedMedia = await resolveDocument(media, "media");
    let attachment = new AttachmentBuilder(path.join(MediaDirectory, resolvedMedia.filename))
    let url = "attachment://" + resolvedMedia.filename

    return {
        attachment, url
    }
}

export async function bulkSendGuildMessages(channel: XRCSuiteChannelType, messages: DiscordMessage[]): Promise<Message[]> {
    let sentMessages: Message[] = []

    for (var msg of messages) {
        let sentMsg = await sendGuildMessage(channel, msg)
        if (sentMsg) {
            sentMessages.push(sentMsg)
        }
        await Throttle.wait(1000)
    }

    return sentMessages
}


export function createAttachmentFromImageData(image: string) {
    // TODO: Fixme! Doesn't work when missing image banner.
    let buff = Buffer.from(image.split(",")[1], "base64")
    let attachment = new AttachmentBuilder(buff)

    return attachment;
}

export async function addRoleToEveryone(roleId: string) {
    let guild = await getGuild();
    if (guild) {
        // Ensure role actually exists first.
        let role = await getGuildRole(roleId);
        if (!role) 
            return;

        let membersMap = await guild.members.fetch()
        let allMembers = Array.from(membersMap.values())
        for (var member of allMembers) {
            let hasRole = member.roles.cache.has(roleId);
            if (!hasRole) {
                await member.roles.add(roleId)
            }

            console.log("added to: " + member.displayName)
        }
    }
}

export async function removeRoleFromEveryone(roleId: string) {
    let guild = await getGuild();
    if (guild) {
        // Ensure role actually exists first.
        let role = await getGuildRole(roleId);
        if (!role) 
            return;

        let membersMap =  await guild.members.fetch()
        let allMembers = Array.from(membersMap.values())
        for (var member of allMembers) {
            let hasRole = member.roles.cache.has(roleId);
            if (hasRole) {
                await member.roles.remove(roleId)
            }
        }
    }
}

type DiscordButton = {
    style: ButtonStyle,
    label: string,
    customId?: string,
    url?: string,
    emoji?: string,
}

export function createButtonRowComponents(buttons: DiscordButton[]): ActionRowBuilder<ButtonBuilder>[] {
    let maxRows = 5;
    let maxButtonsPerRow = 5;
    let totalButtons = Math.min(buttons.length, maxRows * maxButtonsPerRow);

    let numRows = Math.min(5, Math.ceil(buttons.length / 5));
    let rows: ActionRowBuilder<ButtonBuilder>[] = []
    for (var r = 0; r < numRows; r++) {
        let rowStart = maxButtonsPerRow * r;
        let rowEnd = Math.min(rowStart + maxButtonsPerRow, totalButtons);
        let row = new ActionRowBuilder<ButtonBuilder>();

        for (var i = rowStart; i < rowEnd; i++) {
            let button = buttons[i]
            row.addComponents(createButton(button))
        }

        rows.push(row)
    }

    return rows;
}

export function createButton(button: DiscordButton) {
    let builder = new ButtonBuilder()

    builder = builder.setStyle(button.style);
    builder = builder.setLabel(button.label);
    if (button.customId) builder = builder.setCustomId(button.customId)
    if (button.url) builder = builder.setURL(button.url)
    if (button.emoji) builder = builder.setEmoji(button.emoji)

    return builder;
}