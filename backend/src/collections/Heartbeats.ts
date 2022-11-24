import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";
import Devices from "./Devices";

const Heartbeats: CollectionConfig = {
    slug: CollectionSlugs.Heartbeats,
    admin: {
        group: "Audit",
    },
    fields: [
        {
            name: 'device',
            type: 'relationship',
            relationTo: Devices.slug
        },
        {
            name: 'date',
            type: 'date'
        }
    ]
}

export default Heartbeats;