import { Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { LabStatus } from "../../endpoints/Lab/LabStatus";
import StatCard from "./StatCard";

const XRLabStatus: React.FC = () => {
    const [ status, setStatus ] = useState<LabStatus | undefined>(undefined);

    useEffect(() => {
        fetch("/api/globals/lab/status").then(async res => {
            let json = await res.json();
            setStatus(json)
        })
    }, [])

    if (!status) {
        return <h3>Loading...</h3>
    }

    return <Stack direction="row" sx={{marginBottom: 4}} spacing={2}>
        <StatCard title="Status" data={status.open ? "Open" : "Closed" }/>
        <StatCard title="Members" data={status.numberOfMembers}/>
    </Stack>
}

export default XRLabStatus;