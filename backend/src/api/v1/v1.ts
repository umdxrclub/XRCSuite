import { Response } from "express";
import { V1_SCHEMA } from "xrc-schema";
import { APIImplementation } from "../api";
import { heartbeat_post } from "./heartbeat/heartbeat";
import { checkin_post, checkout_post, event_get } from "./terplink/terplink";

export const APIV1: APIImplementation<V1_SCHEMA> = {
    version: "v1",
    schema: {
        get: {
            "/terplink/:eventcode": event_get.handler
        },
        post: {
            "/heartbeat": heartbeat_post.handler,
            "/terplink/:eventcode/checkin": checkin_post.handler,
            "/terplink/:eventcode/checkout": checkout_post.handler
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
export function error(res: Response, msg: string, serverFault?: boolean) {
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
export function success(res: Response, data: any) {
    res.writeHead(200);
    res.write(JSON.stringify(data));
    res.send();
}