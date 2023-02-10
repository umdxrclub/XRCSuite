import { Block } from "payload/types";
import { CollectionSlugs } from "../../slugs";

const Event: Block = {
    slug: "event",
    fields: [
        {
            name: "event",
            type: "relationship",
            relationTo: CollectionSlugs.Events,
            required: true
        }
    ]
}

export default Event;