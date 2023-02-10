import { TextChannel } from "discord.js";
import { Throttle } from "../../util/throttle";
import { DiscordMessage, getGuildChannelById } from "../util";

export type NewMultiMessageIdsListener = (messageIds: string[]) => void

/**
 * A multi message manager is used to make "status" channels on Discord. It can
 * automatically create, edit, and delete a series of messages in a channel so
 * that you can provide live information about something.
 */
class MultiMessageManager {
    public messageUpdateDelayMs: number = 1000
    public alwaysCreateNewMessages: boolean = false
    private _messageIds: string[] = []
    private _channelId: string
    private _channel: TextChannel | undefined
    private _newMessageIdsListeners: NewMultiMessageIdsListener[] = []

    constructor(channelId: string, messageIds?: string[]) {
        this._channelId = channelId;
        if (messageIds) {
            this._messageIds = messageIds;
        }
    }

    public async setMessages(messages: DiscordMessage[]) {
        if (messages.length != this._messageIds.length || this.alwaysCreateNewMessages) {
            await this.deleteAllMessages();
            await this.createMessages(messages)
        } else {
            await this.editMessages(messages)
        }
    }

    public async deleteAllMessages() {
        let channel = await this.getMessageChannel();
        await channel.bulkDelete(this._messageIds);
        this.setMessageIds([])
    }

    public addNewMessageIdListener(listener: NewMultiMessageIdsListener) {
        this._newMessageIdsListeners.push(listener)
    }

    public removeNewMessageIdListener(listener: NewMultiMessageIdsListener) {
        let index = this._newMessageIdsListeners.findIndex(l => l === listener);
        if (index > -1) {
            this._newMessageIdsListeners.splice(index, 1);
        }
    }

    private async createMessages(messages: DiscordMessage[]) {
        let channel = await this.getMessageChannel();
        if (channel) {
            let ids = []
            for (var messageContent of messages) {
                let createdMsg = await this._channel.send(messageContent)
                ids.push(createdMsg.id)

                await Throttle.wait(this.messageUpdateDelayMs)
            }
            this.setMessageIds(ids)
        }
    }

    private async editMessages(messages: DiscordMessage[]) {
        let channel = await this.getMessageChannel();
        if (channel && messages.length == this._messageIds.length) {
            for (var i = 0; i < messages.length; i++) {
                let messageId = this._messageIds[i];
                let messageContent = messages[i];

                let messageToEdit = await channel.messages.fetch(messageId);
                if (messageToEdit) {
                    await messageToEdit.edit(messageContent)
                } else {
                    console.error("Could not find message to edit!")
                }

                await Throttle.wait(this.messageUpdateDelayMs)
            }
        }
    }

    private async getMessageChannel() {
        if (this._channel === undefined) {
            let channel = await getGuildChannelById(this._channelId);
            if (channel && channel instanceof TextChannel) {
                this._channel = channel;
            } else {
                console.warn("Could not find channel for bulk messages!")
            }
        }

        return this._channel
    }

    private setMessageIds(messageIds: string[]) {
        this._messageIds = messageIds;
        this._newMessageIdsListeners.forEach(l => l(this._messageIds))
    }
}

export default MultiMessageManager;