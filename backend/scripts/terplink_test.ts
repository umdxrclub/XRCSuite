import { UMDDirectory } from "../src/util/umd-directory";

(async () => {
    // const result = await UMDDirectory.singleton.advancedSearch({
    //     middleName: "Joseph",
    //     student: true,
    //     umd: true
    // })
    const result = await UMDDirectory.singleton.search("Luke")
    console.log(result)
})();