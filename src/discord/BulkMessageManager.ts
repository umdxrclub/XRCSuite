import { getDiscordClient } from "./bot";
import { DiscordMessage, getGuild } from "./util";

class BulkMessageManager {
    private _messageIds: string[]
    private _channelId: string

    constructor(channelId: string) {
        this._channelId = channelId;
    }

    public async createMessages(messages: DiscordMessage[]) {

    }

    public async delete() {

    }

    public async deleteAll() {
        let guild = await getGuild();
    }
}

export default BulkMessageManager;