import { useTerpLink, XR_CLUB_ID } from "../src/util/terplink";

(async () => {
    const tl = useTerpLink();
    await tl.getBearer();
})();