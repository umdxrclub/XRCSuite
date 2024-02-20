import child_process from "child_process"
import path from "path"
import payload from "payload"
import { MediaDirectory } from "../collections/Media"
import { resolveDocument } from "./payload-backend"

// Why is it necessary to run all of these image functions through a fork?
// Payload internally uses the image manipulation library sharp, and these
// use node-canvas. Unfortunately, on Windows, the two use different versions
// of the same DLL which cannot be loaded simultaneously (you will get an error
// if you try to do so). Therefore, we do all of the image manipulation in a
// child process that can load node-canvas in isolation, and we use IPC to
// transfer the image data between the parent and child process.

var child: child_process.ChildProcess = child_process.fork(require.resolve("./image-fork"))

async function sendAndAwaitIPCMessage(msg: string) {
    let promise = new Promise<child_process.Serializable>(resolve => {
        child.once('message', returnMsg => resolve(returnMsg))
    })
    
    child.send(msg)
    let res = await promise as string;
    return res;
}

export type ForkFunction = {
    name: string,
    args: any[]
}

export type ImageFunctions = {
    createBanner: [string, string, string]
}

async function execFunction<T extends keyof ImageFunctions>(name: T, ...args: ImageFunctions[T]) {
    let res = await sendAndAwaitIPCMessage(JSON.stringify({
        name: name,
        args: args
    }))

    return res;
}

export async function createImageBanner(text: string): Promise<string | undefined> {
    let discord = await payload.findGlobal({ slug: "bot" })
    if (discord?.media?.banner) {
        let banner = await resolveDocument(discord.media.banner, "media")
        if (!banner.filename) return;
        
        // TODO: allow for custom font.
        return await execFunction("createBanner", path.resolve(MediaDirectory, banner.filename), text, "Bahnschrift")
    }
}