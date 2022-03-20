import { APIV1 } from "./src/api/v1/v1";
import createBackendServer from "./src/server";

(async () => {
    await createBackendServer([ APIV1 ]);
})();

