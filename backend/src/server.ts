import express, { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import https from "https";
import { HTTPMethod } from "xrc-schema/src/api/api";
import { APIImplementation } from "./api/api";
import { XRCSequelizeDatabase } from "./data/DatabaseService";
import { BackendService } from "./services/BackendService";
import { CASAuth } from "./services/CASAuthService";
import { serveFrontend } from "./util/frontend";
import { useXRCHost } from "./util/xrc-host-file";
import cors from "cors"

export type ExpressRequestHandler = (req: Request, res: Response, next: NextFunction) => void;

function createLogger(app: express.Express) {
    app.use((req, res, next) => {
        const date = new Date().toISOString();
        const method = req.method.toUpperCase();
        console.log(`[${date}] ${req.socket.remoteAddress} ${method} ${req.url}`);
        const send = res.send.bind(res);
        res.send = (body) => {
            const date = new Date().toISOString();
            console.log(`[${date}] ${res.statusCode} -> ${req.socket.remoteAddress} ${method} ${req.url}`);
            return send(body);
        }

        // Pass request.
        next();
    });
}

const SERVICES: BackendService[] = [ XRCSequelizeDatabase, CASAuth ]

export default async function createBackendServer(apis: APIImplementation<any>[]) {
    const host = useXRCHost();
    const app = express();

    // Enable JSON parsing for requests.
    app.use(express.json());

    // Allow Cross-Origin stuff
    if (host.allowCrossOrigin) {
        app.use(cors())
    }

    // Create logger
    createLogger(app);

    // Configure main path redirect
    if (host.redirect) {
        app.get("/", (req, res) => {
            res.redirect(host.redirect!);
        })
    }

    // For each API version, add all of its routes and handlers.
    apis.forEach(api =>
        (Object.keys(api.schema).forEach(method => {
            (Object.keys(api.schema[method]).forEach(methodPath => {
                const pathSuffix = methodPath.startsWith("/") ? methodPath.substring(1) : methodPath;
                const path = `/api/${api.version}/${pathSuffix}`;
                app[method as HTTPMethod](path, api.schema[method][methodPath]);
                console.log ("Registered " + path + " (" + method.toUpperCase() + ")");
            }))
        }))
    );

    // Load the XRC client (if available)
    await serveFrontend(app);

    // Start any services.
    const servicePromises: Promise<void>[] = []
    SERVICES.forEach(service => servicePromises.push(service.init()))
    await Promise.all(servicePromises)

    const callback = (https: boolean) => {
        console.log(`XRC Backend running on port ${host.port} (https=${https})`);
    }
    if (host.https) {
        https.createServer({
            key: await fs.readFile(host.https.keyPath),
            cert: await fs.readFile(host.https.certPath)
        }, app).listen(host.port, () => callback(true));
    } else {
        app.listen(host.port, () => callback(false));
    }
}