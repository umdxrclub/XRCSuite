import { Chip, Stack, Typography } from "@mui/material";
import { XRCSchema } from "xrc-schema";

import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WifiIcon from '@mui/icons-material/Wifi';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface HeartbeatViewerProps {
    heartbeat: XRCSchema.Heartbeat | undefined
}

export const HeartbeatViewer: React.FC<HeartbeatViewerProps> = ({heartbeat, children}) => {
    if (heartbeat) {
        let chargingIcon = heartbeat.device.battery.charging ? <BatteryChargingFullIcon /> : <BatteryFullIcon />
        let wifi = heartbeat.device.wifi
        let wifiText = `${wifi.ssid} - ${wifi.bssid} - ${wifi.ipAddr} (${wifi.strength} dBm)`
        return <Stack spacing={2} direction="row">
            <Chip icon={<AccessTimeIcon/>} label={heartbeat.date} />
            <Chip icon={chargingIcon} label={heartbeat.device.battery.percentage + "%"}/>
            <Chip icon={<WifiIcon />} label={wifiText}/>
        </Stack>
    } else {
        return <p>Not Found</p>
    }
}