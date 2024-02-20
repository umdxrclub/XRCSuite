import { Endpoint } from "payload/dist/config/types";
import XRC from "../../server/XRC";
import { makeAdminHandler } from "../RejectIfNoUser";

/**
 * This endpoint fetches the current roster and adds any unknown email as a
 * member.
 */
const ApproveRosterEndpoint: Endpoint = {
    path: "/roster/pending",
    method: "post",
    handler: makeAdminHandler(async (req, res) => {
        await XRC.terplink.approveAllProspectiveMembers();

        // Send successful response.
        res.status(200).send()
    })
}

export default ApproveRosterEndpoint;