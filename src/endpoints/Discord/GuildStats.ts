import { Endpoint } from "payload/config";
import { getGuild } from "../../discord/util";

const GuildStatsEndpoint: Endpoint = {
    method: "get",
    path: "/stats",
    handler: async (req, res, next) => {
        let guild = await getGuild();

        res.status(200).send({ count: guild.memberCount })
    }
}

export default GuildStatsEndpoint;