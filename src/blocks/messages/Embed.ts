import { Block } from "payload/types";
import { createDiscordMessageField } from "../../fields/discord/DiscordMessageField";

const Embed: Block = {
    slug: "embed",
    fields: [
        {
            name: "title",
            type: "text"
        },
        createDiscordMessageField({
            name: "description"
        }),
        {
            name: "color",
            type: "text"
        },
        {
            name: "timestamp",
            type: "date"
        },
        {
            name: "url",
            type: "text"
        },
        {
            name: "fields",
            type: "array",
            fields: [
                {
                    name: "name",
                    type: "text",
                    required: true
                },
                {
                    name: "value",
                    type: "text",
                    required: true
                },
                {
                    name: "inline",
                    type: "checkbox",
                    required: true,
                    defaultValue: false
                }
            ]
        }
    ]
}

export default Embed;