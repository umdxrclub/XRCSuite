import {NodeSSH} from "node-ssh";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { constants as fsConstants } from "fs";

const DEPLOY_HOST = "umdxrc.figsware.net";
const DEPLOY_USERNAME = "djfigs1";
const DEPLOY_PATH = "/home/djfigs1/frontend/";
const BUILD_PATH = "./build/";

(async () => {
    // First find the SSH key on the system.
    const keyPath = path.resolve(path.join(os.homedir(), ".ssh/id_rsa"));
    try {
        await fs.access(keyPath, fsConstants.R_OK);
    } catch {
        console.error("Could not find SSH public key located at " + keyPath);
        return;
    }

    // Now ensure that the build path exist.
    const buildPath = path.resolve(BUILD_PATH);
    try {
        if (!(await fs.stat(buildPath)).isDirectory())
            throw new Error();
    } catch {
        console.error("Could not find build at " + buildPath);
        return;
    }

    // Connect to the backend.
    const ssh = new NodeSSH();
    await ssh.connect({
        host: DEPLOY_HOST,
        username: DEPLOY_USERNAME,
        privateKey: keyPath
    });

    // Delet existing frontend directory.
    console.log("Deleting current frontend directory...");
    await ssh.execCommand(`rm -rf ${DEPLOY_PATH}`);

    // Uploaded build directory.
    const succesful = await ssh.putDirectory(buildPath, DEPLOY_PATH, {
        recursive: true,
        concurrency: 2,
        tick: (local, remote, err) => {
            if (err) {
                console.error(`Failed to upload ${local} to ${remote} due to ${err}`);
            } else {
                console.log(`Uploaded ${local} to ${remote}`);
            }
        }
    })

    if (succesful) {
        console.log("Successfully deployed!");
    } else {
        console.error("Deploy unsuccesful! Try again.");
    }

    // Disconnect.
    ssh.dispose();
})();
