import { Endpoint } from "payload/dist/config/types";
import { Event } from "payload/generated-types";
import { resolveMember } from "../../collections/util/MembersUtil";
import XRC from "../../server/XRC";
import { ResolveMethod, ResolveResult } from "../../types/XRCTypes";
import { makeAdminHandler, RejectIfNoUserHandler } from "../RejectIfNoUser";
import { validateQueryParameters } from "../ValidateQueryParams";
/**
 * The required parameters for event check in:
 *
 * m - member resolve method
 * v - member resolve data
 */
let requiredParameters = ['m', 'v'];

const EventCheckIn: Endpoint = {
    path: '/:id/checkin',
    method: 'post',
    handler: [RejectIfNoUserHandler, validateQueryParameters(requiredParameters), async (req, res) => {
        let resolveMethod = req.query.m as ResolveMethod;
        let resolveContent = req.query.v as string;
        let response: ResolveResult

        let event: Event
        try {
            event = await req.payload.findByID({
                collection: "events",
                id: req.params.id
            })
        } catch {
            res.status(400).send({ error: "Could not find an event with that id!" })
            return;
        }

        let member = await resolveMember(resolveMethod, resolveContent);
        if (member) {
            
            // Create attendance event
            await req.payload.create({
                collection: "attendances",
                data: {
                    event: event.id,
                    member: member.id,
                    date: (new Date()).toString(),
                    type: "in"
                }
            })

            response = { 
                member: {
                    name: member.name, 
                    type: "checkin"
                }
            }
        } else {
            response = { error: "Cannot resolve member" }
        }

        await res.status(200).send(response)

    }]
}

export default EventCheckIn;