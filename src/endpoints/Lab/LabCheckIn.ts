import { Endpoint } from "payload/dist/config/types";
import { abort } from "process";
import { resolveMember } from "../../data/MemberManager";
import XRC from "../../data/XRC";
import { CollectionSlugs, GlobalSlugs } from "../../slugs";

/**
 * The required parameters for the lab check in. 
 *
 * m - Resolve method type
 * v - Resolve method content
 */
const requiredParameters = [ 'v', 'm' ]

const LabCheckIn: Endpoint = {
    path: '/checkin',
    method: 'post',
    handler: async (req, res) => {
        // Ensure all the required parameters are provided.
        for (var p of requiredParameters) {
            if (!req.query[p]) {
                res.status(400).json({err: 'Missing query parameter: ' + p});
                return;
            }
        }
        let resolveMethod = req.query.m as any;
        let resolveContent = req.query.v as string;

        let member = await resolveMember(resolveMethod, resolveContent);
        if (member) {
            let lab = await req.payload.findGlobal({
                slug: GlobalSlugs.Lab,
                depth: 0 // don't need to pull everyone's information
            });

            var currentLabMembers = lab.members as string[];
            let indexToRemove = currentLabMembers.indexOf(member.id);

            if (indexToRemove > -1) {
                // Remove member
                currentLabMembers.splice(indexToRemove, 1)
            } else {
                currentLabMembers.push(member.id)
            }

            let checkInType = indexToRemove == -1 ? "in" : "out";

            res.status(200).json({type: checkInType})

            // Update lab state
            await req.payload.updateGlobal({
                slug: GlobalSlugs.Lab,
                data: {
                    ...lab,
                    members: currentLabMembers
                }
            })
        }
    }
}

export default LabCheckIn;