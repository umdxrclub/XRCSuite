import { Endpoint } from "payload/dist/config/types";
import { GlobalSlugs } from "../../slugs";
import { Lab, Member } from "../../types/PayloadSchema";

/**
 * The schema of the public API for retrieving the status of the XR Lab.
 */
export type LabStatus = {
    open: boolean,
    numberOfMembers: number,
    staff: string[]
}

/**
 * The lab status endpoint retrieves information about the current status of the
 * lab for public display. This information includes whether it is open, how
 * many members are currently checked in, what staff are present, and the current
 * lab schedule.
 */
const LabStatusEndpoint: Endpoint = {
    path: "/status",
    method: "get",
    handler: async (req, res, next) => {
        // Get the current lab global store.
        let lab = await req.payload.findGlobal<Lab>({
            slug: GlobalSlugs.Lab
        })

        let members = lab.members as Member[] ?? [];
        let staffNames = [] // members.filter(m => m.leadershipRoles?.length > 0).map(m => m.name);

        // Form the status body.
        let status: LabStatus = {
            open: lab.open,
            numberOfMembers: members.length,
            staff: staffNames
        }

        // Respond with the status.
        res.status(200).send(status)
    }
}

export default LabStatusEndpoint;

// https://umdxrc.figsware.net/api/globals/lab/status