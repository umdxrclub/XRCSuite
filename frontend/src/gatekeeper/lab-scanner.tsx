import React from "react"
import { GatekeeperResolver, GatekeeperScanner } from "./gatekeeper-scanner"

export const LabScanner: React.FC = () => {

    const resolve: GatekeeperResolver = async (method, value) => {
        return null;
    }

    return <React.Fragment>
        <GatekeeperScanner resolve={resolve} />
    </React.Fragment>
}