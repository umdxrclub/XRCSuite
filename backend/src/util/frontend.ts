import { useXRCHost, useHTTPAuth } from "./xrc-host-file";
import path from "path";
import express from "express"

export async function serveFrontend(app: express.Express) {
    const host = useXRCHost();

    if (host.frontend) {
        const staticPathOptions = {
            root: path.resolve(host.frontend!.staticPath)
        }

        const auth = useHTTPAuth();

        // Static resources
        app.get("/frontend/static/*", auth, async (req, res) => {
            const fileName = req.path.split("/frontend/static/")[1];
            res.sendFile(fileName, staticPathOptions);
        });

        // Main page
        app.get("/frontend*", auth, (req, res) => {
            const absPath = path.resolve(host.frontend!.indexPath);
            res.sendFile(absPath);
        });

        console.log("Registered frontend!");
    }
}