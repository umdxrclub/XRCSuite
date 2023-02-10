import { Endpoint } from "payload/config";
import { getGuild } from "../../discord/util";

const GuildStatsEndpoint: Endpoint = {
    method: "get",
    path: "/stats",
    handler: async (req, res) => {
        let guild = await getGuild();
        let channels = await guild.channels.fetch();
        res.status(200).send({ 
            count: guild.memberCount, 
            iconUrl: guild.iconURL(), 
            name: guild.name,
            channels: channels.map(c => ({
                name: c.name,
                id: c.id,
                type: c.type
            }))
        })
    }
}

export default GuildStatsEndpoint;