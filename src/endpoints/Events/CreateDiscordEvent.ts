import { Endpoint } from "payload/dist/config/types";
import { createGuildEvent } from "../../collections/util/EventsUtil";
import { makeAdminHandler } from "../RejectIfNoUser";

const CreateDiscordEventEndpoint: Endpoint = {
    path: "/:id/discord-event",
    method: "post",
    handler: makeAdminHandler(async (req, res) => {
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

        await createGuildEvent(event);
        await res.status(200).send();
    })
}

export default CreateDiscordEventEndpoint;