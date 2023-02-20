import { Response } from "express";
import payload from "payload";
import { Config } from "payload/generated-types";
import { PayloadRequest } from "payload/types";
import { getDocumentId } from "../payload";

type Collections = keyof Config["collections"]
type CollectionData<T extends Collections> = Config["collections"][T]

/**
 * Given a Payload ID or document, resolves into a document.
 *
 * @param doc The document to resolve
 * @param collection The collection that it originates from
 * @param forceResolve Whether to always resolve the document
 * @returns The resolved document
 */
export async function resolveDocument<T extends Collections>(doc: string | CollectionData<T>, collection: T, forceResolve: boolean = false) {
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

export async function resolveDocuments<T extends Collections>(docs: string[] | CollectionData<T>[], collection: T, forceResolve: boolean = false) {
    let docPromises = docs.map(d => resolveDocument(d, collection, forceResolve))
    let resolvedDocs = await Promise.all(docPromises)

    return resolvedDocs;
}

export async function rejectIfNoUser(req: PayloadRequest, res: Response) {
    let shouldReject = !req.user

    if (shouldReject) {
        res.status(401).send()
    }

    return shouldReject;
}