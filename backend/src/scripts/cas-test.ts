import { XRCDatabase } from "../data/DatabaseService";
import XRC from "../data/XRC";

(async () => {
    let tlEvent = await XRC.lab.getTerpLinkEvent();
    let member = await tlEvent.getMemberFromIssuanceId("01a8dc6a-aef0-41b3-9af6-33fa33653616")
    console.log(member)
})();