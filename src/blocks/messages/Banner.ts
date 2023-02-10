import { Block } from "payload/types";

const Banner: Block = {
    slug: "banner",
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true
        },
        {
            name: "type",
            type: "select",
            required: true,
            options: [ "medium", "large" ]
        }
    ]
}

export default Banner;