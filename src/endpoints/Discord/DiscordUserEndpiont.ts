import { User } from "discord.js";
import { Endpoint } from "payload/config";
import { getDiscordClient } from "../../discord/bot";
import { getGuild } from "../../discord/util";
import { DiscordMemberInfo } from "../../types/XRCTypes";

const DiscordUserEndpoint: Endpoint = {
    method: "get",
    path: "/user/:id",
    handler: async (req, res) => {
        let client = await getDiscordClient();
        let guild = await getGuild();
        if (client && guild) {
            var user: User;
            try {
                user = await client.users.fetch(req.params.id);
            } catch {
                await res.status(400).json({ error: "User does not exist! "})
                return;
            }

            let inGuild = false;
            try {
                await guild.members.fetch(user.id);
                inGuild = true;
            } catch { }
            
            if (user) {
                let info: DiscordMemberInfo = {
                    name: `${user.username}#${user.discriminator}`,
                    avatarUrl: user.displayAvatarURL(),
                    inGuild: inGuild
                }
                await res.status(200).json(info)
                return;
            }
        }
        
        await res.status(400).json({ error: "Could not fetch user! "})
    }
}

export default DiscordUserEndpoint;