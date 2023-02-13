import { CollectionConfig } from "payload/types";
import { createDiscordEmojiField } from "../fields/discord/EmojiField";
import { createDiscordRoleField } from "../fields/discord/RoleField";
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
        createDiscordRoleField({
            name: 'discordRoleId',
        }),
        createDiscordEmojiField({
            name: 'discordEmoji'
        }),
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