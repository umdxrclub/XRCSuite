import React, { useState } from "react"
import { Route, Routes } from "react-router-dom"
import { Devices } from "../devices/devices"
import { Gatekeeper } from "../gatekeeper/gatekeeper"
import { LabGatekeeper } from "../gatekeeper/lab-gatekeeper"
import { TerpLinkGatekeeper } from "../gatekeeper/terplink-gatekeeper"
import { Home } from "../home/Home"
import { Members } from "../members/members"
import { NotFound } from "./not-found"
import { XRCAppBar } from "./xrc-app-bar"
import { XRCDrawer } from "./xrc-drawer"

export const App: React.FC = ({}) => {
    const [ drawerOpen, setDrawerOpen ] = useState(false);
    return <React.Fragment>
        <XRCAppBar onMenu={() => setDrawerOpen(true)}/>
        <XRCDrawer open={drawerOpen} onClose={() => setDrawerOpen(false) }/>
        <Routes>
            <Route path="/" element={ <Home /> }/>
            <Route path="/devices" element={ <Devices /> } />
            <Route path="/members" element={ <Members /> } />
            <Route path="/gatekeeper" element={ <Gatekeeper /> } />
            <Route path="/gatekeeper/terplink/:eventcode" element={ <TerpLinkGatekeeper /> }/>
            <Route path="/gatekeeper/lab" element={ <LabGatekeeper /> }/>
            <Route path="*" element={<NotFound/>} />
        </Routes>
    </React.Fragment>
}