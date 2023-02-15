import { Block } from "payload/types";
import { createDiscordEmojiField } from "../../fields/discord/EmojiField";
import { useAsRowTitle } from "../../payload";

const LinkButtons: Block = {
    slug: "linkButtons",
    fields:[
        {
            name: "buttons",
            type: "array",
            admin: {
                components: {
                    RowLabel: useAsRowTitle("title")
                }
            },
            maxRows: 25,
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
                createDiscordEmojiField({
                    name: "emoji"
                })
            ]
        }
    ]
}

export default LinkButtons;