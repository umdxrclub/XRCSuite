import { Divider, Stack } from "@mui/material";
import { Button } from "payload/components/elements";
import React from "react";
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
    return <div>
        <h1>Welcome to the XR Club Management System!</h1>
        <h2>Useful Links</h2>
        <Stack direction="row" spacing={2} alignItems="center" sx={{marginTop: 4, marginBottom: 4}}>
            {Links.map(l => (
                <div><Button key={l.name} el={l.url.startsWith("/") ? "link" : "anchor"} url={l.url} newTab={true}>{l.name}</Button></div>
            ))}
        </Stack>
        <h2>XR Lab</h2>
        <XRLabStatus />
        <h2>Stats</h2>
        <ClubStats />
    </div>
}

export default XRCBeforeDashboard;