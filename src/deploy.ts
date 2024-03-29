import {NodeSSH} from "node-ssh";
import path from "path";
import os from "os";
import fs from "fs/promises";
import dotenv from "dotenv";
import { constants as fsConstants } from "fs";
import { env } from "process";


// Load environment
dotenv.config();

const LocalDistPath = "./dist"
const LocalBuildPath = "./build"

const DeployHost = env.DEPLOY_HOST
const DeployPort = env.DEPLOY_PORT ? parseInt(env.DEPLOY_PORT) : 22
const DeployUsername = env.DEPLOY_USERNAME
const BackendWorkingDirectory = env.DEPLOY_DIR
const BackendDistPath = BackendWorkingDirectory+"/dist";
const BackendBuildPath = BackendWorkingDirectory+"/build";

async function uploadDirectory(ssh: NodeSSH, localSrc: string, deployDir: string) {
    // Delete existing backend src.
    await ssh.execCommand(`rm -rf ${deployDir}`, {});
    console.log("Removed existing directory: " + deployDir)

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
        host: DeployHost,
        port: DeployPort, 
        username: DeployUsername,
        privateKeyPath: keyPath,
    });

    console.log("Connected to backend!")

    await uploadDirectory(ssh, LocalDistPath, BackendDistPath)
    await uploadDirectory(ssh, LocalBuildPath, BackendBuildPath)

    // Upload package.json
    await ssh.putFile("./package.json", BackendWorkingDirectory+"/package.json")
    console.log("Updated package.json")

    // Install packages
    await ssh.execCommand(`yarn`, {cwd: BackendWorkingDirectory})
    console.log("Installed NPM packages")

    // Restart service
    await ssh.execCommand("sudo /usr/bin/systemctl restart xrc.service")

    console.log("Successfully deployed!");

    // Disconnect.
    ssh.dispose();
})();