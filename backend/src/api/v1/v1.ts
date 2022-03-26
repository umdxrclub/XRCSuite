import { Response } from "express";
import { V1_SCHEMA } from "xrc-schema";
import { APIImplementation } from "../api";
import { device_add, device_delete, device_get } from "./devices/devices";
import { heartbeat_get, heartbeat_post } from "./heartbeat/heartbeat";
import { checkin_post, checkout_post, event_get } from "./terplink/terplink";

export const APIV1: APIImplementation<V1_SCHEMA> = {
    version: "v1",
    schema: {
        get: {
            "/heartbeat": heartbeat_get,
            "/terplink/:eventcode": event_get.handler,
            "/devices": device_get

        },
        post: {
            "/devices": device_add,
            "/heartbeat": heartbeat_post.handler,
            "/terplink/:eventcode/checkin": checkin_post.handler,
            "/terplink/:eventcode/checkout": checkout_post.handler
        },
        delete: {
            "/devices": device_delete
        }
    }
}

/**
 * Sends an error JSON object to a response and sets the status code to 400.
 *
 * @param res The response to send the error object
 * @param msg The reason for failure
 * @param serverFault Whether the server was responsible for the error
 */
export function respondError(res: Response, msg: string, serverFault?: boolean) {
    const errorObj = { error: msg };
    res.writeHead(serverFault ? 500 : 400);
    res.write(JSON.stringify(errorObj));
    res.send();
}

/**
 * Sends a successful JSON to a response and sets the status code to 200.
 *
 * @param res The response to send the success object
 * @param data The data to send
 */
export function respondSuccess(res: Response, data?: any) {
    res.writeHead(200);
    res.write(JSON.stringify(data ?? {}));
    res.send();
}