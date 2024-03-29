import XRC from "../server/XRC";
import { Job } from "./Scheduler";

export const ApproveRoster: Job = {
    cron: "0 */2 * * *",
    handler: () => {
        XRC.terplink.approveAllProspectiveMembers();
    }
}
