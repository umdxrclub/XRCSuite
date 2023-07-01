import { TextChannel } from "discord.js";
import payload from "payload";
import { CollectionAfterChangeHook } from "payload/types";
import { getDiscordClient } from "../../discord/bot";
import { GlobalSlugs } from "../../slugs";

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

const AnnouncementsPublisherHook: CollectionAfterChangeHook = async (args) => {
    let wasPublished = args.previousDoc._status !== "published" && args.doc._status === "published"
    let client = getDiscordClient()

    if (client && wasPublished) {
        let { guild } = await payload.findGlobal({
            slug: "bot"
        })

        if (guild?.channels?.announcements) {
            let channel = await client.channels.fetch(guild.channels.announcements);
            if (channel && channel instanceof TextChannel) {
                try {
                    await channel.send(convertRichTextToDiscordString(args.doc.content))
                } catch (e) {
                    console.error("Couldn't send message: " + e)
                }
            }
        }
    }
}

export default AnnouncementsPublisherHook