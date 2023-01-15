import { Endpoint } from "payload/config";
import { createStatSnapshot } from "../../collections/util/StatsUtil";

const RefreshStatsEndpoint: Endpoint = {
    method: "post",
    path: "/stats",
    handler: async (req, res, next) => {
        let snapshot = await createStatSnapshot();
        res.status(200).send(snapshot)
    }
}

export default RefreshStatsEndpoint;