import { MonitorHeart, Nat } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import { Button, CircularProgress, Container, Dialog, DialogActions, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { useEffect, useState } from "react"
import { XRCSchema } from 'xrc-schema'
import { DEVICE_GET_RESPONSE } from "xrc-schema/dist/src/api/v1-schema"
import { getXRC } from "../xrc-api"
import { DeviceAddDialog } from "./device-add-dialog"
import { HeartbeatCompactView } from "./heartbeat-compact-viewer"
import { HeartbeatViewer } from './heartbeat-viewer'
import LocationOnIcon from '@mui/icons-material/LocationOn';

type Location = {
    location: {
        lat: number,
        lng: number,
    },
    accuracy: number
}

async function locateDevice(heartbeat: XRCSchema.DeviceHeartbeat): Promise<Location | null> {
    console.log(heartbeat.heartbeat)
    if (heartbeat.heartbeat.device.wifi.scan) {
        var requestObj = {
            considerIp: false,
            wifiAccessPoints: heartbeat.heartbeat.device.wifi.scan.map(net => {
                return {
                    macAddress: net.bssid,
                    signalStrength: net.level
                }
            })
        }

        const res = await fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCkN71iYb1dbxIw_u_eBiYFRBY-S6BVKk0", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestObj)
        })

        return res.json()
    }
    return null
}

export const Devices: React.FC = ({ children }) => {
    const [ devices, setDevices ] = useState<DEVICE_GET_RESPONSE[] | undefined>(undefined)
    const [ modalHeartbeat, setModalHeartbeat ] = useState<XRCSchema.DeviceHeartbeat | null>(null);
    const [ deviceDialogOpen, setDeviceDialogOpen ] = useState(false);
    const [ deleteConfirmationOpen, setDeleteConfirmationOpen ] = useState(false);

    async function refreshDevices() {
        let devices = (await getXRC().get("/devices", {})).data;
        setDevices(devices);
    }

    async function deleteDevice(serial: string) {
        let res = await getXRC().delete("/devices", { query: {serial: serial }})
        refreshDevices()
    }

    // Fetch devices
    useEffect(() => {
        refreshDevices();
    }, [])

    return <Container>
        <DeviceAddDialog
            open={deviceDialogOpen}
            onClose={() => setDeviceDialogOpen(false)}
            onAdd={refreshDevices}
        />
        <Dialog
            open={deleteConfirmationOpen}
        >
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogActions>
                <Button onClick={() => setDeleteConfirmationOpen(false)}>Cancel</Button>
                <Button onClick={() => setDeleteConfirmationOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <HeartbeatViewer heartbeat={modalHeartbeat} onClose={() => setModalHeartbeat(null)} />
        <TableContainer sx={{maxWidth: 1400, marginTop:4}} component={Paper}>
            {devices === undefined ? <CircularProgress /> :
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Serial Number</TableCell>
                        <TableCell>Last Heartbeat</TableCell>
                        <TableCell>Device Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {devices?.map(dev => (
                        <TableRow>
                            <TableCell>{dev.device.name}</TableCell>
                            <TableCell>{dev.device.serial}</TableCell>
                            <TableCell><HeartbeatCompactView heartbeat={dev.latestHeartbeat}/></TableCell>
                            <TableCell>
                                <IconButton onClick={() => setModalHeartbeat(dev.latestHeartbeat ?? null)}>
                                    <MonitorHeart />
                                </IconButton>
                                { dev.latestHeartbeat?.heartbeat.device.wifi.scan ?
                                    <IconButton onClick={async () => {
                                        const l = await locateDevice(dev.latestHeartbeat!)
                                        if (l) {
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${l.location.lat},${l.location.lng}`)
                                        }
                                    }}>
                                        <LocationOnIcon />
                                    </IconButton>
                                    : null}
                                <IconButton onClick={() => setDeleteConfirmationOpen(true)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>}
        </TableContainer>
        <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => setDeviceDialogOpen(true)}>Add Device</Button>
            <Button variant="contained" onClick={refreshDevices}>Refresh</Button>
        </Stack>
    </Container>
}