import { createStatSnapshot } from "../collections/util/StatsUtil";
import { Job } from "./Scheduler";

const TakeStatsJob: Job = {
    cron: "0 0 * * *",
    handler: createStatSnapshot
}

export default TakeStatsJob