import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";
import { SoftwareDescriptionPrefix } from "../types/XRCTypes";
import Descriptions from "./Descriptions";
import Devices from "./Devices";

const Software: CollectionConfig = {
    slug: CollectionSlugs.Software,
    admin: {
        useAsTitle: 'type',
        group: "Inventory"
    },
    fields: [
        {
            name: 'type',
            type: 'relationship',
            relationTo: Descriptions.slug,
            filterOptions: {
                type: {
                    contains: SoftwareDescriptionPrefix
                }
            }
        },
        {
            name: "availableOn",
            type: 'relationship',
            relationTo: Devices.slug,
            hasMany: true
        },
        {
            name: 'publish',
            type: 'checkbox',
            label: "Display on Public Inventory"
        },
    ]
}

export default Software;