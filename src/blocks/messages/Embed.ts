import { Block } from "payload/types";

const Embed: Block = {
    slug: "embed",
    fields: [
        {
            name: "title",
            type: "text"
        },
        {
            name: "description",
            type: "text"
        },
        {
            name: "color",
            type: "text"
        },
        {
            name: "timestamp",
            type: "date"
        }
    ]
}

export default Embed;