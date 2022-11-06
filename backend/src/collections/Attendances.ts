import { CollectionConfig } from "payload/types";
import Events from "./Events";
import Members from "./Members";

const Attendances: CollectionConfig = {
    slug: 'attendances',
    admin: {
        useAsTitle: 'member'
    },
    fields: [
        {
            name: 'member',
            type: 'relationship',
            relationTo: Members.slug
        },
        {
            name: 'date',
            type: 'date',
        },
        {
            name: 'event',
            type: 'relationship',
            relationTo: Events.slug
        },
        {
            name: 'type',
            type: 'select',
            options: [ "in", "out" ]
        }
    ]
}

export default Attendances;