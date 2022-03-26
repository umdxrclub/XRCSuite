import { APIV1 } from "./api/v1/v1";
import createBackendServer from "./server";

(async () => {
    await createBackendServer([ APIV1 ]);
})();

