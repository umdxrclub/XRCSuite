import { NewsChannel, TextChannel } from "discord.js";
import { CollectionAfterDeleteHook } from "payload/types";
import { getGuildChannelById } from "../../discord/util";
import { Message } from "../../types/PayloadSchema";

const DeleteMessageHook: CollectionAfterDeleteHook = async args => {
    let message = args.doc as Message;
    for (var channel of message.channels) {
        if (channel.messages && channel.messages.length > 0) {
            let discordChannel = await getGuildChannelById(channel.channelId)
            if (discordChannel instanceof TextChannel || discordChannel instanceof NewsChannel) {
                await discordChannel.bulkDelete(channel.messages.map(m => m.messageId))
            }
        }
    }
}

export default DeleteMessageHook;