import { Stack } from "@mui/system";
import { Button, Card } from "payload/components/elements";
import React, { useState, useEffect, useMemo } from "react";
import StatCard from "./StatCard";

function makeStatCard(title: string, data: string | number | undefined) {
    return <Card title={title} actions={<b><p style={{fontSize: 25, flex: 1, margin: 0}}>{data ?? "--"}</p></b>} />
}

const ClubStats: React.FC = () => {
    const [ snapshot, setSnapshot ] = useState<any | undefined>();

    useEffect(() => {
        fetch("/api/stats/current").then(async res => {
            let snapshot = await res.json();
            setSnapshot(snapshot)
        });
    }, [])

    const cards = []

    if (!snapshot) {
        return <h3>Loading...</h3>
    }

    return <React.Fragment>
        <Stack direction="row" sx={{marginBottom: 4}} spacing={2}>
            <StatCard title="TerpLink Roster Members" data={snapshot.count.terplink} />
            <StatCard title="Discord Members" data={snapshot.count.discord} />
            <StatCard title="YouTube Subscribers" data={snapshot.count.youtube} />
            <StatCard title="Instagram Followers" data={snapshot.count.instagram} />
            <StatCard title="Twitter Followers" data={snapshot.count.twitter} />
        </Stack>
    </React.Fragment>
}

export default ClubStats;