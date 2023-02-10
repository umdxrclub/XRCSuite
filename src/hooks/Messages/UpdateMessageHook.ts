import { CollectionAfterChangeHook, CollectionBeforeChangeHook } from "payload/types";
import { sendMessage } from "../../collections/util/MessageUtil";
import { Message } from "../../types/PayloadSchema";

function areSetsEqual<T>(arr1: T[], arr2: T[], property: (item: T) => any): boolean {
    return arr1.length == arr2.length && arr1.every(a => arr2.some(b => property(a) === property(b)))
}

function deepEquality(a: any, b: any): boolean {
    let typeA = typeof(a);
    let typeB = typeof(b);
    let isStringObj = typeA == "string" && typeB == "object" || typeA == "object" && typeB == "string";
    let isUnresolvedField = isStringObj && ((typeA == "object" && a["id"]) || (typeB == "object" && b["id"]))
    if (isUnresolvedField) {
        // This can happen with a relation field, it may be unresolved and therefore
        // we check if the ids are still the same.
        let objId = typeA === "object" ? a["id"] : b["id"];
        let strId = typeA === "string" ? a : b;
        return objId === strId
    } else if (typeA != typeB) {
        return false;
    }
        

    switch (typeof(a)) {
        case "object":
            if (Array.isArray(a) != Array.isArray(b)) {
                return false;
            } else if (Array.isArray(a) && Array.isArray(b)) {
                return a.every((_, i) => deepEquality(a[i], b[i]))
            }

            let aKeys = Object.keys(a);
            let bKeys = Object.keys(b);

            if (aKeys.length != bKeys.length)
                return false;

            return aKeys.every(k => deepEquality(a[k], b[k]))
        default:
            return a === b;
    }
}

const UpdateMessageHook: CollectionAfterChangeHook = async args => {
    let [ message, prevMessage ] = [ args.doc, args.previousDoc ] as Message[]; 
    if (args.operation == "update") {
        let channelsAreSame = areSetsEqual(prevMessage.channels, message.channels, x => x.channelId)
        if (channelsAreSame) {
            let contentIsSame = deepEquality(message.content, prevMessage.content)
            if (contentIsSame) {
                return;
            } else {
                console.log(JSON.stringify(prevMessage.content))
                console.log(JSON.stringify(message.content))
            }
        }
    }

    await sendMessage(message.id)
}

export default UpdateMessageHook;