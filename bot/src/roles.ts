import { Client, TextChannel } from "discord.js";
import { getDiscordConfig } from "./config";

/**
 * Creates a message with reaction emojis to allow people to add roles.
 * 
 * @param channelId The channel to create the react message in
 */
export async function createRoleReactMessage(client: Client, guildId: string) {
    let config = await getDiscordConfig();

    // Ensure that the provided guild id exists in the roles file.
    if (Object.keys(config.guilds).includes(guildId)) {
        let guild = client.guilds.cache.get(guildId);
        
        if (guild) {
            let guildConfig = config.guilds[guildId];
            let channel = guild.channels.cache.get(guildConfig.roles.channelId) as TextChannel | undefined;

            if (channel) {
                let msg = await channel.send("Choose a role below!");
                await msg.react("😁");
            }
        }
    }
}
