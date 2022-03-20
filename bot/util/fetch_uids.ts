import { useXRDatabase } from "../src/data/xrdata";
import TerpConnect from "../src/terpconnect";

async function run() {
    var tc = new TerpConnect()
    await tc.connect()

    // Lookup and dump all users.
    const users = await tc.lookupAllUsers();
    const data = useXRDatabase();
    await data.dumpUIDs(users);

    await tc.disconnect();
}

run();