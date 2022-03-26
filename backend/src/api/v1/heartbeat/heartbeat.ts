import { Request, Response } from "express";
import { XRCSchema } from "xrc-schema"
import { MODELS } from "../../../data/DatabaseService";
import { APIRoute } from "../../api";
import { respondError, respondSuccess } from "../v1";

export async function heartbeat_get(req: Request, res: Response) {

}

/**
 * Handles an incoming device heartbeat.
 */
export const heartbeat_post: APIRoute = {
    path: "/heartbeat",
    method: "post",
    handler: async (req, res) => {
        const heartbeat = req.body as XRCSchema.Heartbeat;
        const ip = req.socket.remoteAddress

        try {
            // Save the heartbeat
            await MODELS.heartbeat.create({
                serial: heartbeat.device.serial,
                heartbeat: heartbeat,
                externalIp: ip as string
            })
        } catch (e) {
            respondError(res, (e as Error).message)
            return;
        }

        var consoleMsg = `(<3 ${heartbeat.type}) ${heartbeat.device.serial}: `;
        var charging = heartbeat.device.battery.charging ? '+' : '';
        consoleMsg += `bat=${charging}${heartbeat.device.battery.percentage}, `;
        consoleMsg += `ssid=${heartbeat.device.wifi.ssid}, `;
        consoleMsg += `bssid=${heartbeat.device.wifi.bssid}`;
        console.log(consoleMsg);

        respondSuccess(res)
    }
}