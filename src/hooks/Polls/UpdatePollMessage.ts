import { TextChannel } from "discord.js";
import { CollectionAfterChangeHook } from "payload/types";
import { getDiscordClient } from "../../discord/bot";
import { createPollEmbedAndRow } from "../../discord/commands/Poll";

const UpdatedPollMessageHook: CollectionAfterChangeHook = async (args) => {
    let doc = args.doc;
    let client = await getDiscordClient();

    // Create the embed/row
    let { embed, row } = await createPollEmbedAndRow(doc)

    let messages = doc.messages;
    messages.forEach(async (msg) => {
        let channelId = msg.channel;
        let messageId = msg.msg;

        // Get the channel of the message.
        let channel = await client.channels.cache.get(channelId).fetch();
        if (!channel || !(channel instanceof TextChannel)) return;

        // Get the message
        let message = await channel.messages.fetch(messageId)
        if (!message) return;

        // Update the message
        await message.edit({ content: "", embeds: [embed], components: row ? [row] : [] })
    })
}

export default UpdatedPollMessageHook;