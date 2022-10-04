import { XRCDatabase } from "../data/DatabaseService";
import XRC from "../data/XRC";

(async () => {
    let roster = await XRC.terplink.getRosterMembers();
    roster.forEach(rm => console.log(rm.name));
    console.log("TOTAL: " + roster.length)
})();