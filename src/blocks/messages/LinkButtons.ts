import { Block } from "payload/types";

const LinkButtons: Block = {
    slug: "buttonRow",
    fields:[
        {
            name: "buttons",
            type: "array",
            fields: [
                {
                    name: "title",
                    type: "text",
                    required: true
                },
                {
                    name: "url",
                    type: "text",
                    required: true
                },
                {
                    name: "emoji",
                    type: "text",
                }
            ]
        }
    ]
}

export default LinkButtons;