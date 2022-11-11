import { CollectionConfig } from "payload/types";
import Devices from "./Devices";

const Heartbeats: CollectionConfig = {
    slug: 'heartbeats',
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