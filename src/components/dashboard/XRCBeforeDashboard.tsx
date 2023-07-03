import React from "react";
import { createActionButtons } from "../ActionButtons";
import ClubStats from "./ClubStats";
import XRLabStatus from "./XRLabStatus";

const Links: { name: string, url: string }[] = [
    {
        name: "XR Club Website",
        url: "https://xr.umd.edu"
    },
    {
        name: "Lab Gatekeeper",
        url: "/admin/gatekeeper"
    },
    {
        name: "TerpLink Events",
        url: "https://terplink.umd.edu/manage/organization/xr-club/events/events?orderByField=StartDateTime&orderByDirection=1"
    },
    {
        name: "TerpLink Roster",
        url: "https://terplink.umd.edu/actioncenter/organization/xr-club/roster/Roster/prospective"
    }
]

const XRCBeforeDashboard: React.FC = () => {
    let LinkButtons = createActionButtons(Links.map(l => ({type: "link", ...l})))
    return <div>
        <h1>Welcome to the XR Club Management System!</h1>
        <h2>Useful Links</h2>
        <LinkButtons />
        <h2>XR Lab</h2>
        <XRLabStatus />
        <h2>Stats</h2>
        <ClubStats />
    </div>
}

export default XRCBeforeDashboard;