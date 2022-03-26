import { query, Request, Response } from "express";
import { V1_SCHEMA } from "xrc-schema";
import { DEVICE_GET_RESPONSE } from "xrc-schema/src/api/v1-schema";
import { MODELS } from "../../../data/DatabaseService";
import { getQueryParams } from "../../api";
import { respondError, respondSuccess } from "../v1";

/**
 * Adds a device into the XRC database. Every device must have some name and
 * a serial number.
 */
export async function device_add(req: Request, res: Response) {
    // Get the device properties
    try {
        var queryParams = getQueryParams<V1_SCHEMA["post"]["/devices"]>(req, {
            serial: true,
            name: true
        })
    } catch (err) {
        respondError(res, (err as Error).message)
        return;
    }

    try {
        var device = await MODELS.device.create({
            name: queryParams.name,
            serial: queryParams.serial
        })
    } catch (err) {
        respondError(res, (err as Error).message)
        return;
    }

    respondSuccess(res, device)
}

/**
 * Gets devices from the database and their states.
 */
export async function device_get(req: Request, res: Response) {
    let devices = await MODELS.device.findAll();
    respondSuccess(res, await Promise.all(devices.map(async dev => {
        let resp = {
            device: {
                name: dev.name,
                serial: dev.serial
            }
        } as DEVICE_GET_RESPONSE

        // Find latest heartbeat (if any)
        let heartbeat = (await MODELS.heartbeat.findLatestHeartbeat(dev.serial)) ?? undefined
        if (heartbeat)
            resp.latestHeartbeat = heartbeat

        return resp
    })))
}

/**
 * Deletes a device from the database.
 */
export async function device_delete(req: Request, res: Response) {
    // Get the device properties
    try {
        var queryParams = getQueryParams<V1_SCHEMA["delete"]["/devices"]>(req, {
            serial: true,
        })
    } catch (err) {
        respondError(res, (err as Error).message)
        return;
    }

    try {
        let result = await MODELS.device.destroy({ where: {
            serial: queryParams.serial
        }})
        respondSuccess(res, result)
    } catch (err) {
        respondError(res, (err as Error).message)
        return;
    }
}