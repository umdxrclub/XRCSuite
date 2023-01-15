import startWebServer from "./server";
import { serveDiscordBot } from "./discord/bot"
import dotenv from "dotenv";
import { scheduleJobs } from "./jobs/Scheduler";

// Load environment
dotenv.config();

(async () => {
    await startWebServer();

    console.log("Backend server ready, starting Discord bot...")
    await serveDiscordBot();

    scheduleJobs();

    console.log("XRCSuite is now ready.")
})();

