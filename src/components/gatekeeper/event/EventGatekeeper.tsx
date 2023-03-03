import { Box, Typography } from "@mui/material";
import React from "react";
import { useLocation, useRouteMatch } from 'react-router-dom'
import { Throttle } from "../../../util/throttle";
import { RobotoLink } from "../../util/RobotoLink";
import { GatekeeperResolver, GatekeeperScanner } from "../scanner/GatekeeperScanner";

const EventGatekeeperResolver: GatekeeperResolver = async (method, value) => {
    await Throttle.wait(1000)
    console.log("DONE")
    return {
        error: "Not implemented"
    }
}

export const EventGatekeeper: React.FC = ({ }) => {
    const match = useRouteMatch<{id: string}>();
    const eventId = match.params.id;

    return <Box width="100%" height="100%" display="flex" flexDirection="row">
        <RobotoLink />
        <Box flex={4}>

        </Box>
        <GatekeeperScanner resolver={EventGatekeeperResolver} />
    </Box>
}