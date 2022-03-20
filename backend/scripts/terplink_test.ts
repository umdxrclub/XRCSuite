import { CASAuth } from "../src/services/CASAuthService";
import { useTerpLink } from "../src/util/terplink";

(async () => {
    // Perform UMD CAS auth if necessary.
    await CASAuth.init();

    // Get the TerpLink event.
    const tl = useTerpLink();
    const tle = await tl.getEvent("6AR5GM8");

    return;
    console.log("Attendees before: " + (await tle.getEventAttendees()).map(a => a.getName()))

    const ian = (await tle.lookupMembers("Ian Morrill"))[0];
    await ian.checkIn();

    console.log("Attendees after: " + (await tle.getEventAttendees()).map(a => a.getName()))

})();