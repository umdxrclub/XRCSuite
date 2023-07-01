import XRC from "../server/XRC";
import { Job } from "./Scheduler";

export const ApproveRoster: Job = {
    cron: "0 0 0/2 1/1 * ? *",
    handler: () => {
        XRC.terplink.approveAllProspectiveMembers();
    }
}
