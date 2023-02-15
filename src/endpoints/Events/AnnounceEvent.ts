import { Endpoint } from "payload/dist/config/types";
import { announceEvent } from "../../collections/util/EventsUtil";

const AnnounceEventEndpoint: Endpoint = {
    path: "/:id/announce",
    method: "post",
    handler: async (req, res, next) => {
        const eventId = req.params.id;

        var event;
        try {
            event = await req.payload.findByID({
                collection: "events",
                id: eventId
            })
        } catch {
            res.status(400).send({ error: "Could not find an event with that id!" })
            return;
        }

        await announceEvent(event)
        res.status(200).send()
    }
}

export default AnnounceEventEndpoint;