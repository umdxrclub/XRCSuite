import fs from "fs/promises";

const CONFIG_FILE_PATH = "./credentials/config.json";
const STORE_FILE_PATH = "./credentials/store.json";

export type XRDiscordConfig = {
    clientId: string,
    clientSecret: string,
    token: string,
    guilds: {
        [ guildId: string ]: {
            roles: {
                channelId: string,
                reactions: {
                    [ roleId: string ]: string
                }
            }
        }
    }
}

var config: XRDiscordConfig | undefined = undefined

export async function getDiscordConfig() {
    if (config == undefined) {
        let configContents = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
        config = JSON.parse(configContents) as XRDiscordConfig;
    }

    return config;
}

/**
 * The data structure for data stored by this Discord bot.
 */
export type XRDiscordStore = {
    guilds: {
        [ guildId: string ]: {
            reactionMessage?: string
        }
    }
}

const DEFAULT_STORE: XRDiscordStore = {
    guilds: {}
}

/**
 * Handles the storing of data for the Discord bot.
 */
export class XRDiscordData {

    static shared: XRDiscordData = new XRDiscordData();

    private store: XRDiscordStore | undefined = undefined

    private constructor() {
        this.load()
    }

    private async load() {
        if (!this.store) {
            try {
                // Try to read store contents
                let storeContents = await fs.readFile(STORE_FILE_PATH, "utf-8")
                this.store = JSON.parse(storeContents) as XRDiscordStore
            } catch (error) {
                // If the file doesn't exist, create the default store.
                await fs.writeFile(STORE_FILE_PATH, JSON.stringify(DEFAULT_STORE))
                this.store = {} as any
                Object.assign(this.store, DEFAULT_STORE);
            }
        }
    }

    private async save() {
        await fs.writeFile(STORE_FILE_PATH, JSON.stringify(this.store))
    }

    async getReactionMessageId(guildId: string): Promise<string | undefined> {
        await this.load();

        return this.store?.guilds[guildId]?.reactionMessage;
    }

    async setReactionMessageId(guildId: string, messageId: string) {
        await this.load();

        if (!this.store!.guilds[guildId])
            this.store!.guilds[guildId] = {}

        this.store!.guilds[guildId].reactionMessage = messageId;

        await this.save();
    }
}