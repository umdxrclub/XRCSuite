import { Endpoint } from "payload/config";
import { getGuild } from "../../discord/util";

const GuildStatsEndpoint: Endpoint = {
    method: "get",
    path: "/stats",
    handler: async (req, res) => {
        let guild = await getGuild();
        let channels = await guild.channels.fetch();
        let emojiMap = await guild.emojis.fetch()
        let emojis = Array.from(emojiMap.values())
        let rolesMap = await guild.roles.fetch()
        let roles = Array.from(rolesMap.values())
        res.status(200).send({ 
            count: guild.memberCount, 
            iconUrl: guild.iconURL(), 
            name: guild.name,
            channels: channels.map(c => ({
                name: c.name,
                id: c.id,
                type: c.type
            })),
            emojis: emojis.map(e => ({
                name: e.name,
                animated: e.animated,
                url: e.url,
                id: e.id
            })),
            roles: roles.map(r => ({
                id: r.id,
                name: r.name,
                priority: r.position,
                color: r.hexColor
            })).sort((a,b) => b.priority - a.priority)
        })
    }
}

export default GuildStatsEndpoint;