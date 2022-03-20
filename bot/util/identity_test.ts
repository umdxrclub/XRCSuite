import UMDIdentityScraper from "../src/umd_identity";

(async () => {
    const identity = new UMDIdentityScraper();
    console.log(await identity.lookup("lverno"));
})();
