import payload from "payload";
import { Config } from "payload/generated-types";

export async function resolveDocument<T extends keyof Config["collections"]>(doc: string | Config["collections"][T], collection: T) {
    // If we already have an object just return it.
    if (typeof(doc) !== "string")
        return doc;

    // Find the requested document.
    let resolvedDoc = await payload.findByID({
        id: doc,
        collection: collection,
        showHiddenFields: true,
        overrideAccess: true
    })

    return resolvedDoc;
}