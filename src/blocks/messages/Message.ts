import { Block } from "payload/types";
 
const Message: Block = {
    slug: "message",
    fields: [
        {
            name: "body",
            type: "richText",
            admin: {
                leaves: ["bold", "italic", "strikethrough", "code", "underline"],
                elements: ["blockquote"],
            },
            required: true
        }
    ]
}

export default Message;