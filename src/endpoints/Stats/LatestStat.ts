import { Endpoint } from "payload/config";
import { createStatSnapshot } from "../../collections/util/StatsUtil";
import { makeAdminHandler } from "../RejectIfNoUser";

const LatestStatEndpoint: Endpoint = {
    method: "get",
    path: "/current",
    handler: makeAdminHandler(async (req, res, next) => {
        let allDocs = await req.payload.find({
            sort: "date",
            collection: "stats",
            limit: 1
        })

        var snapshot;
        if (allDocs.totalDocs == 1) {
            snapshot = allDocs.docs[0];
        } else {
            snapshot = await createStatSnapshot();
        }

        res.status(200).send(snapshot)
    })
}

export default LatestStatEndpoint;