import { Endpoint } from "payload/dist/config/types";
import { createMemberProfile, getAllLeadershipMembers } from "../../collections/util/MembersUtil";

const LeadershipEndpoint: Endpoint = {
    path: "/leadership",
    method: "get",
    handler: async (req, res, next) => {
        let leadership = await getAllLeadershipMembers();
        let profiles = leadership.docs.map(createMemberProfile)
        res.status(200).send(profiles)
    }
}

export default LeadershipEndpoint;