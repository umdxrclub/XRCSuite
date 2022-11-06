import { GlobalConfig } from "payload/types";
import Events from "../collections/Events";
import Members from "../collections/Members";

const Lab: GlobalConfig = {
    slug: 'lab',
    fields: [
        {
            name: 'open',
            type: 'checkbox'
        },
        {
            name: 'event',
            type: 'relationship',
            relationTo: Events.slug
        },
        {
            name: 'members',
            type: 'array',
            fields: [
                {
                    name: 'member',
                    type: 'relationship',
                    relationTo: Members.slug,
                    unique: true
                }
            ]
        }
    ]
};

export default Lab;