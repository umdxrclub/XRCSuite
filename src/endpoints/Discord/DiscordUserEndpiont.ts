import { Endpoint } from "payload/config";
import { getDiscordClient } from "../../discord/bot";
import { getGuild } from "../../discord/util";

const DiscordUserEndpoint: Endpoint = {
    method: "get",
    path: "/user/:id",
    handler: async (req, res) => {
        let client = await getDiscordClient();
        let guild = await getGuild();
        if (client && guild) {
            let user = await client.users.fetch(req.params.id);
            let inGuild = !!(await guild.members.fetch(req.params.id));
            if (user) {
                await res.status(200).json({
                    name: `${user.username}#${user.discriminator}`,
                    avatarUrl: user.displayAvatarURL(),
                    inGuild: inGuild
                })
                return;
            }
        }
        
        await res.status(400).json({ error: "Could not fetch user! "})
    }
}

export default DiscordUserEndpoint;