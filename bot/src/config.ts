import fs from "fs/promises";

const CONFIG_FILE_PATH = "./credentials/config.json";

export type XRDiscordConfig = {
    clientId: string,
    clientSecret: string,
    token: string,
    guilds: {
        [ guildId: string ]: {
            roles: {
                channelId: string,
                roleReactions: {
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