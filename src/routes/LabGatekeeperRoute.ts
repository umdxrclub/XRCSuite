import { AdminRoute } from "payload/dist/config/types";
import { LabGatekeeper } from "../components/gatekeeper/lab/lab-gatekeeper";

const LabGatekeeperRoute: AdminRoute = {
    path: "/gatekeeper",
    Component: LabGatekeeper,
    exact: true
}

export default LabGatekeeperRoute;