import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import { XRCSchema } from "xrc-schema"
import { getXRC } from "../xrc-api"
import { DeviceAddDialog } from "./device-add-dialog"
import DeleteIcon from '@mui/icons-material/Delete';
import { DEVICE_GET_RESPONSE } from "xrc-schema/dist/api/v1-schema"
import { HeartbeatViewer } from "./heartbeat-viewer"

export const Devices: React.FC = ({ children }) => {
    const [ devices, setDevices ] = useState<DEVICE_GET_RESPONSE[] | undefined>(undefined)
    const [ deviceDialogOpen, setDeviceDialogOpen ] = useState(false);

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

    return <div>
        <DeviceAddDialog
            open={deviceDialogOpen}
            onClose={() => setDeviceDialogOpen(false)}
            onAdd={refreshDevices}
        />
        <TableContainer sx={{maxWidth: 1400}} component={Paper}>
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
                            <TableCell><HeartbeatViewer heartbeat={dev.latestHeartbeat}/></TableCell>
                            <TableCell>
                                <IconButton onClick={() => deleteDevice(dev.device.serial)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>}
        </TableContainer>
        <Button variant="contained" onClick={() => setDeviceDialogOpen(true)}>Add Device</Button>
        <Button variant="contained" onClick={refreshDevices}>Refresh</Button>
    </div>
}