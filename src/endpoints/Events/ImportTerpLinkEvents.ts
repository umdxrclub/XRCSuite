import Events from "../../collections/Events";
import { Endpoint } from "payload/dist/config/types";
import XRC from "../../data/XRC";
import { XR_CLUB_ID } from "../../util/terplink";
import { CollectionSlugs } from "../../slugs";
import parse from "node-html-parser";

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

            let parsedDescription = parse(event.description)
            let descriptionText = parsedDescription.textContent || parsedDescription.innerText || event.description;

            let eventId = event.id.toString()
            let eventData = {
                name: event.name,
                startDate: event.startsOn,
                endDate: event.endsOn,
                imageUrl: event.imageUrl,
                description: descriptionText,
                terplink: {
                    eventId: eventId,
                }
            }

            if (result.totalDocs == 0) {
                // Get access code
                let page = await XRC.terplink.parseEventPage(event.id);

                console.log("Got access code " + page.accessCode + " for event " + event.name);

                // Create the new event.
                await req.payload.create({
                    collection: Events.slug,
                    data: {
                        ...eventData,
                        location: page.location,
                        terplink: {
                            ...eventData.terplink,
                            accessCode: page.accessCode
                        }
                    }
                })
            } else {
                await req.payload.update({
                    collection: CollectionSlugs.Events,
                    id: result.docs[0].id,
                    data: eventData
                })
            }
        })

        await Promise.all(promises);

        res.status(200).send();
    }
}

export default ImportEventsEndpoint;