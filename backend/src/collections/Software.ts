import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";
import Descriptions from "./Descriptions";

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
            validate: software => {
                console.log(software)
                return true;
            }
        },
        {
            name: 'publish',
            type: 'checkbox',
            label: "Display on Public Inventory"
        },
    ]
}

export default Software;