import { Button, Paper, Stack, TextField, Typography, Container } from "@mui/material";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const TERPLINK_EVENTS_URL = "https://terplink.umd.edu/manage/organization/xr-club/events/events?orderByField=StartDateTime&orderByDirection=1"

export const Gatekeeper: React.FC = ({ }) => {
    const navigate = useNavigate();
    const tlRef = useRef<HTMLInputElement>();

    const handleTerplinkCode = (event: React.FormEvent<HTMLFormElement>) => {
        navigate("/gatekeeper/terplink/" + tlRef.current!.value);
    }

    return <Container sx={{display: "flex", flexDirection: "column", padding: 4}}>
        <Paper sx={{padding: 2, display: "flex", justifyContent: "center", alignSelf: "center"}}>
            <form onSubmit={handleTerplinkCode}>
                <Stack spacing={2}>
                    <Typography variant="h6" textAlign={"center"}>TerpLink Gatekeeper</Typography>
                    <TextField placeholder="ABCDEF" inputRef={tlRef} />
                    <Button onClick={() => window.open(TERPLINK_EVENTS_URL)}>Open TerpLink</Button>
                    <Button type="submit" variant="contained">Launch</Button>
                </Stack>
            </form>
        </Paper>
        <Button onClick={() => navigate("/gatekeeper/lab")}>Lab Gatekeeper</Button>
    </Container>
}