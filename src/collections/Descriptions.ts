import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";
import { DescriptionType } from "../types/XRCTypes";

const Descriptions: CollectionConfig = {
    slug: CollectionSlugs.Descriptions,
    admin: {
        useAsTitle: 'name',
        group: "Inventory",
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: CollectionSlugs.Media
        },
        {
            name: 'type',
            type: 'select',
            options: DescriptionType,
            required: true
        },
        {
            name: 'description',
            type: "textarea",
            required: true,
        }
    ]
}

export default Descriptions;