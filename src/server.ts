import express, { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import https from "https";
import payload from "payload";
import process from "process"

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

export default async function startWebServer() {
    const app = express();

    // Enable JSON parsing for requests.
    app.use(express.json());

    // Create logger
    createLogger(app);

    const callback = (https: boolean) => {
        console.log(`XRC Backend running on port ${process.env.port} (https=${https})`);
    }

    // Start payload
    await payload.initAsync({
        secret: process.env.MONGO_SECRET,
        mongoURL: process.env.MONGO_URL,
        express: app
    })

    let port = process.env.PORT ?? 8080;

    if (process.env.HTTPS_KEY_PATH && process.env.HTTPS_CERT_PATH) {
        https.createServer({
            key: await fs.readFile(process.env.HTTPS_KEY_PATH),
            cert: await fs.readFile(process.env.HTTPS_CERT_PATH)
        }, app).listen(port, () => callback(true));
    } else {
        app.listen(port, () => callback(false));
    }
}