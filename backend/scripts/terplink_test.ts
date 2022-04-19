import { useTerpLink, XR_CLUB_ID } from "../src/util/terplink";

(async () => {
    const tl = useTerpLink();

    console.log(await tl.getEvents(XR_CLUB_ID))
})();