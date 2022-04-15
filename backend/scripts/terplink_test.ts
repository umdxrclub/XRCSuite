import { useTerpLink } from "../src/util/terplink";

(async () => {
    const tl = useTerpLink();
    const tle = await tl.getEvent("9JA4EPX");
    const members = await tle!.getEventAttendees();
    console.log(members)
})();