import { Response } from "express";
import payload from "payload";
import { Config } from "payload/generated-types";
import { PayloadRequest } from "payload/types";
import { getDocumentId } from "../payload";

export async function resolveDocument<T extends keyof Config["collections"]>(doc: string | Config["collections"][T], collection: T, forceResolve: boolean = false) {
    // If we already have an object just return it.
    if (typeof(doc) !== "string" && !forceResolve)
        return doc;

    // Find the requested document.
    let resolvedDoc = await payload.findByID({
        id: getDocumentId(doc),
        collection: collection,
        showHiddenFields: true,
        overrideAccess: true
    })

    return resolvedDoc;
}

export async function rejectIfNoUser(req: PayloadRequest, res: Response) {
    let shouldReject = !req.user

    if (shouldReject) {
        res.status(401).send()
    }

    return shouldReject;
}