import { GlobalConfig } from "payload/types";
import Descriptions from "../collections/Descriptions";

const Wishlist: GlobalConfig = {
    slug: 'wishlist',
    admin: {
        group: "Inventory"
    },
    fields: [
        {
            name: 'wishlist',
            type: 'array',
            fields: [
                {
                    name: 'type',
                    type: 'relationship',
                    relationTo: Descriptions.slug
                },
                {
                    name: 'quantity',
                    type: 'number',
                    defaultValue: 1
                },
            ]
        }
    ]
}

export default Wishlist;