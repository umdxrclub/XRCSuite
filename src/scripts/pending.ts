import { exit } from "process";
import XRC from "../server/XRC";
import startXRCSuite from "../suite"

(async () => {
    await startXRCSuite(true);
    await XRC.terplink.approveAllProspectiveMembers();
    exit();
})()