import {NodeSSH} from "node-ssh";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { constants as fsConstants } from "fs";

const SRC_PATH = "./dist"
const DEPLOY_HOST = "umdxrc.figsware.net";
const DEPLOY_USERNAME = "djfigs1";
const DEPLOY_NODE_PATH = "/home/djfigs1/backend";
const DEPLOY_SRC_PATH = DEPLOY_NODE_PATH+"/dist";

(async () => {
    // First find the SSH key on the system.
    const keyPath = path.resolve(path.join(os.homedir(), ".ssh/id_rsa"));
    try {
        await fs.access(keyPath, fsConstants.R_OK);
    } catch {
        console.error("Could not find SSH public key located at " + keyPath);
        return;
    }

    // Connect to the backend.
    const ssh = new NodeSSH();
    await ssh.connect({
        host: DEPLOY_HOST,
        username: DEPLOY_USERNAME,
        privateKey: keyPath,
    });

    // Delete existing backend src.
    await ssh.execCommand(`rm -rf ${DEPLOY_SRC_PATH}`);
    console.log("Removed existing backend source files")

    // Uploaded src directory.
    await ssh.putDirectory(SRC_PATH, DEPLOY_SRC_PATH, {
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

    // Upload package.json
    await ssh.putFile("./package.json", DEPLOY_NODE_PATH+"/package.json")
    console.log("Updated package.json")

    // Install packages
    await ssh.execCommand(`npm i --only=prod`, {cwd: DEPLOY_NODE_PATH})
    console.log("Installed NPM packages")

    console.log("Successfully deployed!");

    // Disconnect.
    ssh.dispose();
})();
