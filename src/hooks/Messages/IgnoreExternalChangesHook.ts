import { Message } from "payload/generated-types";
import { FieldHook } from "payload/types";

const IgnoreExternalChangesHook: FieldHook = async args => {
    let shouldChange = args.req.payloadAPI == "local" && args.req.method == undefined
    let newValue = shouldChange ? args.value : args.previousValue;
    if (!shouldChange && !newValue) {
        let channelId = args.siblingData.channelId;
        let doc = await args.req.payload.findByID({ collection: "messages", id: args.originalDoc.id, showHiddenFields: true }) as Message;
        let channel = doc.channels.find(c => c.channelId === channelId)
        if (channel) {
            newValue = channel.messages;
        }
    }
    return newValue
}

export default IgnoreExternalChangesHook;