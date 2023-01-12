import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";
import Descriptions from "./Descriptions";


const Devices: CollectionConfig = {
    slug: CollectionSlugs.Devices,
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
            type: 'relationship',
            relationTo: Descriptions.slug
        },
        {
            name: 'publish',
            type: 'checkbox',
            label: "Display on Public Inventory"
        },
        {
            name: 'serialNumber',
            type: 'text'
        }
    ]
}

export default Devices;