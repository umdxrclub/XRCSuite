import payload from "payload";

export async function resolveDocument<T extends { id: string }>(doc: string | T, collection: string) {
    // If we already have an object just return it.
    if (typeof(doc) !== "string")
        return doc;

    // Find the requested document.
    return await payload.findByID<T>({
        id: doc,
        collection: collection
    })
}