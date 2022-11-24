import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import https from "https";
import payload from "payload";
import { getXRCHost } from "../util/host";
import { API } from "./api/api";
import { serveFrontend } from "./util/frontend";

export type ExpressRequestHandler = (req: Request, res: Response, next: NextFunction) => void;

function createLogger(app: express.Express) {
    app.use((req, res, next) => {
        const date = new Date().toISOString();
        const method = req.method.toUpperCase();
        console.log(`[${date}] ${req.socket.remoteAddress} ${method} ${req.url}`);
        
        // Pass request.
        next();
    });
}

export default async function startWebServer(apis: API[]) {
    const host = getXRCHost();
    const app = express();

    // Enable JSON parsing for requests.
    app.use(express.json());

    // Create logger
    createLogger(app);

    // Configure main path redirect
    if (host.redirect) {
        app.get("/", (req, res) => {
            res.redirect(host.redirect!);
        })
    }

    apis.forEach(api => {
        // Register each API route
        api.routes.forEach(routeConfig => {
            const routePath = routeConfig.path;
            const pathSuffix = routePath.startsWith("/") ? routePath.substring(1) : routePath;
            const path = `/api/${api.basePath}/${pathSuffix}`;
            Object.keys(routeConfig.handlers).forEach(k => {
                let method = k as keyof(typeof routeConfig.handlers);
                let handler = routeConfig.handlers[method]!;
                app[method](path, async (req, res) => {
                    let result = await handler(req,res);
                    await api.responseHandler(req,res,result);
                });
            });
        });
    });

    // Load the XRC client (if available)
    await serveFrontend(app);

    const callback = (https: boolean) => {
        console.log(`XRC Backend running on port ${host.port} (https=${https})`);
    }

    // Start payload
    await payload.initAsync({
        secret: "fas8dfus89aufeanf",
        mongoURL: "mongodb://127.0.0.1/xrc-debug",
        express: app
    })

    if (host.https) {
        https.createServer({
            key: await fs.readFile(host.https.keyPath),
            cert: await fs.readFile(host.https.certPath)
        }, app).listen(host.port, () => callback(true));
    } else {
        app.listen(host.port, () => callback(false));
    }
}