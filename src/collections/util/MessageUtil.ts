import { ButtonStyle, EmbedBuilder, NewsChannel, TextChannel } from "discord.js";
import payload from "payload";
import { createAttachmentFromImageData, createAttachmentFromMedia, createButtonRowComponents, DiscordMessage, getGuildChannelById } from "../../discord/util";
import { rgbToNumber } from "../../util/payload";
import { CollectionSlugs } from "../../slugs";
import { Message } from "../../types/PayloadSchema";
import { createImageBanner } from "../../server/image";
import { resolveDocument } from "../../server/payload-backend";
import { Throttle } from "../../util/throttle";
import { createRoleSelectMessage } from "./RolesUtil";

function wrap(text: string, wrapper: string) {
    return wrapper + text + wrapper
}

/**
 * Converts a rich text body to a string that can be sent by the Discord bot.
 * @param richText The rich text to convert
 * @returns The formatted string
 */
function convertRichTextToDiscordString(richText: any[]) {
    let message = ""

    richText.forEach((parent, i) => {
        parent.children.forEach((child: any) => {
            if (child.text) {
                let childText = child.text
                if (child.bold) {
                    childText = wrap(childText, "**")
                }
                if (child.italic) {
                    childText = wrap(childText, "*")
                }
                if (child.strikethrough) {
                    childText = wrap(childText, "~~")
                }
                if (child.code) {
                    childText = wrap(childText, "```")
                }
                if (child.underline) {
                    childText = wrap(childText, "__")
                }
                message += childText
            }
        })

        if (i < richText.length - 1) {
            message += "\n";
        }
    })

    return message
}

export async function createDiscordMessages(message: Message): Promise<DiscordMessage[]> {
    let messages: DiscordMessage[] = []

    for (var block of message.content) {
        switch (block.blockType) {
            case "linkButtons":
                let buttonRows = createButtonRowComponents(block.buttons.map(b => ({
                    label: b.title,
                    url: b.url,
                    emoji: b.emoji,
                    style: ButtonStyle.Link
                })))

                messages.push({ components: buttonRows })
                break;
            case "image":
                let attachment = await createAttachmentFromMedia(block.image)
                if (attachment) messages.push({ files: [attachment.attachment]})
                break;
            case "banner":
                let banner = await createImageBanner(block.title)
                if (banner) {
                    let bannerAttachment = await createAttachmentFromImageData(banner)
                    messages.push({ files: [ bannerAttachment ]})
                }
                break;
            case "roleSelect":
                let roles = await createRoleSelectMessage();
                messages.push(roles);
                break;
            case "message":
                let richText = block.body;
                let convertedRichText = convertRichTextToDiscordString(richText);
                messages.push({content: convertedRichText})
                break;
            case "embed":
                let embed = new EmbedBuilder();
                if (block.title) embed.setTitle(block.title)
                if (block.timestamp) embed.setTimestamp(new Date(block.timestamp))
                if (block.description) embed.setDescription(convertRichTextToDiscordString(block.description))
                if (block.color) embed.setColor(rgbToNumber(block.color))
                if (block.fields.length > 0) embed.setFields(block.fields.map(b => ({name: b.name, value: b.value, inline: b.inline })))
                if (block.url) embed.setURL(block.url)

                messages.push({ embeds: [embed] })
                break;
        }
    }

    return messages;
}

export async function sendMessage(message: string | Message) {
    let resolvedMessage = await resolveDocument(message, "messages");
    let messagesToSend = await createDiscordMessages(resolvedMessage);
    await sendDiscordMessages(resolvedMessage, messagesToSend);
}

export async function sendDiscordMessages(message: string | Message, messages: DiscordMessage[]) {
    let resolvedMessage = await resolveDocument(message, "messages", true);

    let messageChannels = resolvedMessage.channels;
    let newMessageChannels: Message["channels"] = []
    for (var channel of messageChannels) {
        let discordChannel = await getGuildChannelById(channel.channelId);

        if (discordChannel && (discordChannel instanceof TextChannel || discordChannel instanceof NewsChannel)) {
            // Determine whether new messages are needed.
            let shouldCreateNewMessages = channel.alwaysResendMessages || channel.messages == undefined || channel.messages.length != messages.length;

            // Delete previous messages.
            if (shouldCreateNewMessages && channel.messages?.length > 0) {
                try {
                    await discordChannel.bulkDelete(channel.messages.map(m => m.messageId));
                } catch { }
            }

            let sentMessagesIds: string[] = []
            for (var i = 0; i < messages.length; i++) {
                let content = messages[i];
                var updatedMessageId: string
                if (shouldCreateNewMessages) {
                    let newMessage = await discordChannel.send(content);
                    updatedMessageId = newMessage.id;
                } else {
                    let prevMessage = await discordChannel.messages.fetch(channel.messages[i].messageId)
                    let editedMessage = await prevMessage.edit(content)
                    updatedMessageId = editedMessage.id;
                }

                sentMessagesIds.push(updatedMessageId);
                await Throttle.wait(100);
            }
            newMessageChannels.push({
                ...channel,
                messages: sentMessagesIds.map(id => ({ messageId: id }))
            })
        }
    }

    let newMsg = await payload.update({
        collection: "messages",
        id: resolvedMessage.id,
        data: {
            channels: newMessageChannels
        }
    })
}