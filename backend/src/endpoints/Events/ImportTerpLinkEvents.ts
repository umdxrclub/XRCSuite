import Events from "../../collections/Events";
import { Endpoint } from "payload/dist/config/types";
import XRC from "../../data/XRC";
import { XR_CLUB_ID } from "../../util/terplink";

/**
 * Imports all TerpLink events into the database.
 */
const ImportEventsEndpoint: Endpoint = {
    path: "/terplink",
    method: "post",
    handler: async (req, res, next) => {
        let clubEvents = await XRC.terplink.getEvents(XR_CLUB_ID);
        let promises = clubEvents.map(async event => {
            console.log("Got event: " + event.name)

            // See if this event has already been created.
            let result = await req.payload.find({
                collection: Events.slug,
                where: {
                    'terplink.eventId': {
                        equals: event.id
                    }
                }
            })

            if (result.totalDocs == 0) {
                // Get access code
                let accessCode = await XRC.terplink.getAccessCode(event.id);

                console.log("Got access code " + accessCode + " for event " + event.name);
                let eventId = event.id.toString()
                console.log(eventId)

                // Create the new event.
                await req.payload.create({
                    collection: Events.slug,
                    data: {
                        name: event.name,
                        startDate: event.startsOn,
                        endDate: event.endsOn,
                        imageUrl: event.imageUrl,
                        description: event.description,
                        terplink: {
                            eventId: eventId,
                            accessCode: accessCode,
                        }
                    }
                })
            }
        })

        await Promise.all(promises);

        res.status(200).send();
    }
}

export default ImportEventsEndpoint;