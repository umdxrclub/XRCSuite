import { Block } from "payload/types";
import { createDiscordMessageField } from "../../fields/discord/DiscordMessageField";
 
const Message: Block = {
    slug: "message",
    fields: [
        createDiscordMessageField({
            name: "body",
            required: true
        })
    ]
}

export default Message;