import { UMDDirectory } from "../src/util/umd-directory";

(async () => {
    const result = await UMDDirectory.singleton.search("Frezzo")
    console.log(result)
})();