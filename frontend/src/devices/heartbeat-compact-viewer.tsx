import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import WifiIcon from '@mui/icons-material/Wifi';
import LanguageIcon from '@mui/icons-material/Language';
import { Chip, Stack } from "@mui/material";
import { XRCSchema } from "xrc-schema";
import moment from "moment"

interface HeartbeatCompactViewProps {
    heartbeat: XRCSchema.DeviceHeartbeat | undefined
}

export const HeartbeatCompactView: React.FC<HeartbeatCompactViewProps> = ({heartbeat, children}) => {
    if (heartbeat) {
        let chargingIcon = heartbeat.heartbeat.device.battery.charging ? <BatteryChargingFullIcon /> : <BatteryFullIcon />
        let wifi = heartbeat.heartbeat.device.wifi
        return <Stack spacing={2} direction="row">
            <Chip icon={<AccessTimeIcon/>} label={moment(heartbeat.heartbeat.date).fromNow()} />
            <Chip icon={chargingIcon} label={heartbeat.heartbeat.device.battery.percentage + "%"}/>
            <Chip icon={<WifiIcon />} label={wifi.ssid}/>
            <Chip icon={<LanguageIcon />} label={heartbeat.externalIp} />
        </Stack>
    } else {
        return <p>Not Found</p>
    }
}