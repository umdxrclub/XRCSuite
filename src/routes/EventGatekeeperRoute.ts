import { AdminRoute } from "payload/config";
import { EventGatekeeper } from "../components/gatekeeper/event/EventGatekeeper";

const EventGatekeeperRoute: AdminRoute = {
    path: "/gatekeeper/event/:id",
    Component: EventGatekeeper
}

export default EventGatekeeperRoute;