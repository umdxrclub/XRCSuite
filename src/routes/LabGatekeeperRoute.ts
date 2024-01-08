import { AdminRoute } from "payload/dist/config/types";
import { LabGatekeeper } from "../components/gatekeeper/lab/LabGatekeeper";

const LabGatekeeperRoute: AdminRoute = {
    path: "/gatekeeper",
    Component: LabGatekeeper,
    exact: true
}

export default LabGatekeeperRoute;