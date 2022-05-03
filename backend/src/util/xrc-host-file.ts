import basicAuth from "express-basic-auth";
import fs from "fs";
import { ExpressRequestHandler } from "../server";

export interface XRCHostConfiguration {
    publicURL: string,
    port: number
    db: {
        database: string,
        username: string,
        password: string,
        port: number
    },
    cas: {
        username: string,
        password: string,
        device: string,
        hotpSecret: string
    },
    https?: {
        keyPath: string,
        certPath: string
    },
    frontend?: {
        staticPath: string,
        indexPath: string,
    },
    logins: {
        [key: string]: string
    },
    terplink: {
        labEventCode?: string
    }
    redirect?: string,
    allowCrossOrigin?: boolean
}

var CURRENT_HOST: XRCHostConfiguration | undefined

export function useXRCHost(): XRCHostConfiguration {
    if (!CURRENT_HOST) {
        const config = fs.readFileSync("./host.json", "utf-8");
        const host = JSON.parse(config) as XRCHostConfiguration;
        CURRENT_HOST = host;
    }

    return CURRENT_HOST;
}

var auth: ExpressRequestHandler | undefined = undefined
export function useHTTPAuth() {
    if (!auth) {
        const host = useXRCHost();
        auth = basicAuth({
            users: host.logins,
            challenge: true
        });
    }

    return auth!;
}