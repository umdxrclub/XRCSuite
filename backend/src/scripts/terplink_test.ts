import { XRCSequelizeDatabase } from "../data/DatabaseService";
import { TerpLink } from "../src/util/terplink";
import { UMDDirectory } from "../src/util/umd-directory";

(async () => {
    await XRCSequelizeDatabase.init();
    const me = await (await TerpLink.singleton.getLabEvent())!.getMemberFromIssuanceId("cfa1db62-ab0e-43f1-bd03-f74afbd4aaff");
    console.log(me.getAccount());
})();