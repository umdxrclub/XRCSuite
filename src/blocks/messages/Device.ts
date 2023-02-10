import { Block } from "payload/types";
import { CollectionSlugs } from "../../slugs";

const Device: Block = {
    slug: "device",
    fields: [
        {
            name: 'device',
            type: 'relationship',
            relationTo: CollectionSlugs.Devices,
            required: true
        }
    ]
}

export default Device;