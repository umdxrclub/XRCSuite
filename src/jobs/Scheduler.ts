import schedule from "node-schedule";
import TakeStatsJob from "./TakeStats";
import { ApproveRoster } from "./ApproveRoster";

export type Job = {
    cron: string,
    handler: () => void
}

const Jobs: Job[] = [
    TakeStatsJob,
    ApproveRoster
]

/**
 * Schedules all jobs in the Job array.
 */
export function scheduleJobs() {
    Jobs.forEach(({cron, handler}) =>  {
        console.log("Scheduled job with cron: " + cron)
        schedule.scheduleJob(cron, handler)
    })
}