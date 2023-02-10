import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Roles: CollectionConfig = {
    slug: CollectionSlugs.Roles,
    admin: {
        useAsTitle: 'name',
    },
    // hooks: {
    //     afterChange: [ RolesChangeHook ]
    // },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true
        },
        {
            name: 'color',
            type: 'text'
        },
        {
            name: 'priority',
            type: 'number',
            defaultValue: 1000,
            required: true
        },
        {
            name: 'discordRoleId',
            type: 'text'
        },
        {
            name: 'discordEmoji',
            type: 'text'
        },
        {
            name: 'isLeadership',
            type: 'checkbox',
            defaultValue: false,
            required: true
        },
        {
            name: 'isSelfAssignable',
            type: 'checkbox',
            defaultValue: false,
            required: true
        }
    ],
    timestamps: false
}

export default Roles;