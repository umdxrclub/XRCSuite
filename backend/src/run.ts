import { API_V1 } from './web/api/v1/v1';
import { XRCDatabase } from './data/DatabaseService';
import { BackendService } from './services/BackendService';
import startWebServer from "./web/server";
import { startDiscordBot } from "./discord/bot"

const SERVICES: BackendService[] = [
    // XRCDatabase
];

(async () => {
    console.log("Starting backend services...")
    // Start backend services.
    const servicePromises = SERVICES.map(service => service.init());
    for (var promise of servicePromises)
        await promise;

    console.log("Backend services ready, starting web server...")
    await startWebServer([ API_V1 ]);
    // console.log("Backend server ready, starting Discord bot...")
    // await startDiscordBot();
    console.log("XRCSuite is now ready.")
})();

