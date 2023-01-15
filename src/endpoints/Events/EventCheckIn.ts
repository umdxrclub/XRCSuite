import { Endpoint } from "payload/dist/config/types";
import { resolveMember } from "../../data/MemberManager";
import XRC from "../../data/XRC";
import { CollectionSlugs } from "../../slugs";

/**
 * The required parameters for event check in:
 *
 * a - event access code
 * m - member resolve method
 * v - member resolve data
 */
let requiredParameters = ['a', 'm', 'v'];

const EventCheckIn: Endpoint = {
    path: '/checkin',
    method: 'post',
    handler: async (req, res, next) =>  {
        // Ensure all the required parameters are provided.
        for (var p of requiredParameters) {
            if (!req.query[p]) {
                res.status(400).json({err: 'Missing query parameter: ' + p});
                return;
            }
        }

        let accessCode = req.query.a as string;
        let resolveMethod = req.query.m as string;
        let resolveContent = req.query.v as string;

        let tlEvent = await XRC.terplink.getEvent(accessCode);
        if (tlEvent) {
            let member = await resolveMember(resolveMethod as any, resolveContent)

            if (member) {
                res.status(200).send()
            }

            // Get the event within the database.
            let eventSearch = await req.payload.find({
                collection: CollectionSlugs.Events,
                where:  {
                    'terplink.accessCode': {
                        equals: accessCode
                    }
                }
            })

            if (eventSearch.totalDocs == 1) {
                let event = eventSearch.docs[0];

                // Check the member in on terplink.
                tlEvent.checkIn(member.umd.terplink.accountId);

                // Create an attendance
                req.payload.create({
                    collection: CollectionSlugs.Attendances,
                    data: {
                        member: member.id,
                        date: new Date(),
                        event: event.id,
                        type: "in"
                    }
                })
            }
        }
    }
}

export default EventCheckIn;