import dotenv from "dotenv";
import startXRCSuite from "./suite";

// Load environment
dotenv.config();

(async () => {
    await startXRCSuite();
})();

