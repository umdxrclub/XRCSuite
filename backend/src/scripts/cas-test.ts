import { XRCDatabase } from "../data/DatabaseService";
import XRC from "../data/XRC";

(async () => {
    await XRCDatabase.init();
    let member = await XRC.members.getMember({steamId: "Damian Figueroa"})
    if (member) {
        console.log(await XRC.lab.addMember(member));
        console.log(XRC.lab.getMembersInLab());
    }
})();