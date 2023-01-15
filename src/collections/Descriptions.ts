import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const DEVICE_TYPES: string[] = [
    "Desktop",
    "Laptop",
    "VR Headset",
    "AR Headset",
    "Phone",
    "Software"
]

const Descriptions: CollectionConfig = {
    slug: CollectionSlugs.Descriptions,
    admin: {
        useAsTitle: 'name',
        group: "Inventory",
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'type',
            type: 'select',
            options: DEVICE_TYPES
        },
        {
            name: 'description',
            type: 'richText'
        }
    ]
}

export default Descriptions;