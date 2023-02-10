import { Block } from "payload/types";
import { CollectionSlugs } from "../../slugs";

const Poll: Block = {
    slug: "poll",
    fields: [
        {
            name: "poll",
            type: "relationship",
            relationTo: CollectionSlugs.Polls,
            required: true
        },
        {
            name: "allowVoting",
            type: "checkbox",
            required: true,
            defaultValue: true
        }
    ]
}

export default Poll;