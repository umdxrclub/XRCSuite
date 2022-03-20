import { XRCSchema } from "xrc-schema"
import { APIRoute } from "../../api";

/**
 * Handles an incoming device heartbeat.
 */
export const heartbeat_post: APIRoute = {
    path: "/heartbeat",
    method: "post",
    handler: async (req, res) => {
        const heartbeat = req.body as XRCSchema.Heartbeat;

        var consoleMsg = `(<3 ${heartbeat.type}) ${heartbeat.device.serial}: `;
        var charging = heartbeat.device.battery.charging ? '+' : '';
        consoleMsg += `bat=${charging}${heartbeat.device.battery.percentage}, `;
        consoleMsg += `ssid=${heartbeat.device.wifi.ssid}, `;
        consoleMsg += `bssid=${heartbeat.device.wifi.bssid}`;
        console.log(consoleMsg);

        // Reply with successful attempt.
        res.status(200).send();
    }
}