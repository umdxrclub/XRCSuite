import { AdminRoute } from "payload/dist/config/types";
import { LabGatekeeper } from "../components/gatekeeper/lab/lab-gatekeeper";

const GatekeeperRoute: AdminRoute = {
    path: "/gatekeeper",
    Component: LabGatekeeper
}

export default GatekeeperRoute;