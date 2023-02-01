import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Roles: CollectionConfig = {
    slug: CollectionSlugs.Roles,
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'color',
            type: 'text'
        },
        {
            name: 'priority',
            type: 'number'
        },
        {
            name: 'discordRoleId',
            type: 'text'
        }
    ],
    timestamps: false
}

export default Roles;