import { Gatekeeper } from "gatekeeper/gatekeeper"
import { LabGatekeeper } from "gatekeeper/lab/lab-gatekeeper"
import React, { useState } from "react"
import { matchRoutes, Route, Routes, useLocation } from "react-router-dom"
import { EventGatekeeper } from "../gatekeeper/event-gatekeeper"
import { NotFound } from "./not-found"
import { XRCAppBar } from "./xrc-app-bar"
import { XRCDrawer } from "./xrc-drawer"

const AppRoutes = [
    // {
    //     path: "/",
    //     element: Home
    // },
    // {
    //     path: "/devices",
    //     element: Devices
    // },
    // {
    //     path: "/members",
    //     element: Members
    // },
    {
        path: "/gatekeeper",
        element: Gatekeeper
    },
    {
        path: "/gatekeeper/terplink/:eventcode",
        element: EventGatekeeper,
        showAppBar: false
    },
    {
        path: "/gatekeeper/lab",
        element: LabGatekeeper,
        showAppBar: false
    },
    {
        path: "*",
        element: NotFound
    }
]

export const App: React.FC = ({}) => {
    const [ drawerOpen, setDrawerOpen ] = useState(false);
    const location = useLocation();
    const [{route}] = matchRoutes(AppRoutes, location)!;
    const useAppBar = (route as any).showAppBar ?? true

    return <React.Fragment>
        {   useAppBar ? <React.Fragment>
                <XRCAppBar onMenu={() => setDrawerOpen(true)}/>
                <XRCDrawer open={drawerOpen} onClose={() => setDrawerOpen(false) }/>
            </React.Fragment> : null
        }

        <Routes>
            {AppRoutes.map(r => {
                return <Route key={r.path} path={r.path} element={<r.element />} />
            })}
        </Routes>
    </React.Fragment>
}