import { TerpLinkSchema } from "../types/terplink";
import { XRCSchema } from "../types/xrc";
import { EMPTY } from "./api";
declare type TERPLINK_EVENTCODE_PATH_PARAMS = {
    path: {
        eventcode: string;
    };
};
declare type TERPLINK_MEMBER_CONFIG = {
    parameters: TERPLINK_EVENTCODE_PATH_PARAMS & {
        query: {
            instanceId: string;
        };
    };
    response: TerpLinkSchema.Account;
};
declare type DEVICE_ADD = {
    parameters: {
        query: {
            serial: string;
            name: string;
        };
    };
    response: boolean;
};
declare type DEVICE_GET = {
    parameters: {};
    response: DEVICE_GET_RESPONSE[];
};
export declare type DEVICE_GET_RESPONSE = {
    device: XRCSchema.Device;
    latestHeartbeat?: XRCSchema.Heartbeat;
};
export default interface V1_SCHEMA {
    get: {
        "/heartbeat": {
            parameters: {
                query: {
                    numHeartbeats?: number;
                };
            };
            response: string;
        };
        "/terplink/:eventcode": {
            parameters: TERPLINK_EVENTCODE_PATH_PARAMS;
            response: XRCSchema.ClubEvent;
        };
        "/devices": DEVICE_GET;
    };
    post: {
        "/devices": DEVICE_ADD;
        "/heartbeat": {
            parameters: {
                data: XRCSchema.Heartbeat;
            };
            response: EMPTY;
        };
        "/terplink/:eventcode/checkin": TERPLINK_MEMBER_CONFIG;
        "/terplink/:eventcode/checkout": TERPLINK_MEMBER_CONFIG;
    };
    delete: {
        "/devices": {
            parameters: {
                query: {
                    serial: string;
                };
            };
            response: number;
        };
    };
}
export {};