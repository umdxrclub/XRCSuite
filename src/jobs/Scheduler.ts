import schedule from "node-schedule";

export type Job = {
    cron: string,
    handler: () => void
}

const Jobs: Job[] = [
    
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