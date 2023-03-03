import { Block } from "payload/types";
import { createTimeBlockField } from "../../util/payload";
import { CollectionSlugs } from "../../slugs";

const Opening: Block = {
    slug: "opening",
    fields: [
        createTimeBlockField({
            name: "time"
        }),
        {
            name: "staff",
            type: "relationship",
            hasMany: true,
            relationTo: CollectionSlugs.Members
        },
        {
            name: "note",
            type: "textarea"
        }
    ]
}

export default Opening