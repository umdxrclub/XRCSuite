import basicAuth from "express-basic-auth";
import fs from "fs";
import { ExpressRequestHandler } from "../web/server";

export interface XRCHostConfiguration {
    publicURL: string,
    port: number
    db: {
        database: string,
        username: string,
        password: string,
        port: number
    },
    discord: {
        clientId: string,
        clientSecret: string,
        token: string,
        guilds: {
            [ guildId: string ]: {
                roles: {
                    channelId: string,
                    reactions: {
                        [ roleId: string ]: string
                    }
                }
            }
        }
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
    labEventId: number,
    redirect?: string,
    allowCrossOrigin?: boolean
}

var CURRENT_HOST: XRCHostConfiguration | undefined

/**
 * Loads the current XRC Host config for disk. If already loaded, this will just
 * return the cached version.
 *
 * @returns The XRC host configuration
 */
export function getXRCHost(): XRCHostConfiguration {
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
        const host = getXRCHost();
        auth = basicAuth({
            users: host.logins,
            challenge: true
        });
    }

    return auth!;
}