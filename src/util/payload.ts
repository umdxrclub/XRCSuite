import payload from "payload";
import { octet } from "webidl-conversions"

/**
 * Retrieves the id of a specified document. Payload sometimes represents documents
 * just by their ID as a string, but other times the full document is returned,
 * in which case you have to get the id via the "id" property. This will return
 * the id in either of these cases.
 *
 * @param doc The document which may just be a string id
 * @returns The id of the document
 */
export function getDocumentId(doc: string | { id: string } ) {
    return typeof(doc) === "string" ? doc : doc.id
}

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