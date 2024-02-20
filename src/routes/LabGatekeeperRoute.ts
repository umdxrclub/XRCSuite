import { AdminView } from "payload/dist/config/types";
import { LabGatekeeper } from "../components/gatekeeper/lab/LabGatekeeper";

const LabGatekeeperRoute: AdminView = {
    path: "/gatekeeper",
    Component: LabGatekeeper,
}

export default LabGatekeeperRoute;