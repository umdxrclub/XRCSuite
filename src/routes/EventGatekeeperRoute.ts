import { AdminView } from "payload/config";
import { EventGatekeeper } from "../components/gatekeeper/event/EventGatekeeper";

const EventGatekeeperRoute: AdminView = {
    path: "/gatekeeper/event/:id",
    Component: EventGatekeeper
}

export default EventGatekeeperRoute;