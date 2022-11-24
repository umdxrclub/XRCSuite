import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Guilds: CollectionConfig = {
    slug: CollectionSlugs.Guilds,
    admin: {
        useAsTitle: 'name',
        group: 'Discord'
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'guildId',
            type: 'text'
        },
        {
            name: 'announcementsId',
            type: 'text'
        },
        {
            name: 'auditId',
            type: 'text'
        }
    ]
}

export default Guilds;