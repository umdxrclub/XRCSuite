import {NodeSSH} from "node-ssh";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { constants as fsConstants } from "fs";

const BACKEND_SRC_PATH = "./backend/src"
const FRONTEND_SRC_PATH = "./frontend/build"
const SHARED_SRC_PATH = "./shared"
const DEPLOY_HOST = "umdxrc.figsware.net";
const DEPLOY_USERNAME = "xrc";
const BACKEND_DEPLOY_PATH = "/home/xrc/suite/backend";
const FRONTEND_DEPLOY_PATH = "/home/xrc/suite/frontend";
const SHARED_DEPLOY_PATH = "/home/xrc/suite/shared";

const BACKEND_SRC_DEPLOY_PATH = BACKEND_DEPLOY_PATH+"/src";

async function uploadDirectory(ssh: NodeSSH, localSrc: string, deployDir: string) {
    // Delete existing backend src.
    await ssh.execCommand(`rm -rf ${deployDir}`);
    console.log("Removed existing backend source files")

    // Uploaded backend src directory.
    await ssh.putDirectory(localSrc, deployDir, {
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
}

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
        privateKeyPath: keyPath,
    });

    await uploadDirectory(ssh, BACKEND_SRC_PATH, BACKEND_SRC_DEPLOY_PATH)

    // Upload package.json
    await ssh.putFile("./backend/package.json", BACKEND_DEPLOY_PATH+"/package.json")
    console.log("Updated package.json")

    // Install packages
    await ssh.execCommand(`npm i`, {cwd: BACKEND_DEPLOY_PATH})
    console.log("Installed NPM packages")

    await uploadDirectory(ssh, FRONTEND_SRC_PATH, FRONTEND_DEPLOY_PATH);

    await uploadDirectory(ssh, SHARED_SRC_PATH, SHARED_DEPLOY_PATH);

    // Restart service
    // await ssh.execCommand("sudo /usr/bin/systemctl restart xrc.service")

    console.log("Successfully deployed!");

    // Disconnect.
    ssh.dispose();
})();
