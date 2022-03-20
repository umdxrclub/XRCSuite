import { TerpLinkSchema } from "../types/terplink";
import { XRCSchema } from "../types/xrc";
import { EMPTY } from "./api";

type TERPLINK_EVENTCODE_PATH_PARAMS = {
    path: {
        eventcode: string
    }
}

type TERPLINK_MEMBER_CONFIG = {
    parameters: TERPLINK_EVENTCODE_PATH_PARAMS & {
        query: {
            instanceId: string
        }
    },
    response: TerpLinkSchema.Account,
}

export default interface V1_SCHEMA {
    get: {
        "/terplink/:eventcode": {
            parameters: TERPLINK_EVENTCODE_PATH_PARAMS,
            response: XRCSchema.ClubEvent
        }
    },

    post: {
        "/heartbeat": {
            parameters: {
                data: XRCSchema.Heartbeat
            },
            response: EMPTY
        }
        "/terplink/:eventcode/checkin": TERPLINK_MEMBER_CONFIG
        "/terplink/:eventcode/checkout": TERPLINK_MEMBER_CONFIG,
    }
}