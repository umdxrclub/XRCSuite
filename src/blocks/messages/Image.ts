import { Block } from "payload/types";
import { CollectionSlugs } from "../../slugs";

const Image: Block = {
    slug: "image",
    fields: [
        {
            name: "image",
            type: "upload",
            relationTo: CollectionSlugs.Media,
            required: true
        }
    ]
}

export default Image;