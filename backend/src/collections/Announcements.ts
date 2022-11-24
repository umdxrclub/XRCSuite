import { CollectionConfig } from "payload/types";
import AnnouncementsPublisherHook from "../endpoints/Announcements/AnnouncementPublisher";
import { CollectionSlugs } from "../slugs";

const Announcements: CollectionConfig = {
    slug: CollectionSlugs.Announcements,
    admin: {
        useAsTitle: 'title',
        group: 'Discord',
    },
    hooks: {
        afterChange: [ AnnouncementsPublisherHook ]
    },
    fields: [
        {
            name: 'title',
            type: 'text'
        },
        {
            name: 'guilds',
            type: 'relationship',
            relationTo: CollectionSlugs.Guilds,
            hasMany: true
        },
        {
            name: 'content',
            type: 'richText',
            admin: {
                leaves: ["bold", "italic", "strikethrough", "code", "underline"],
                elements: ["blockquote"]
            }
        },
        {
            name: 'sentMessages',
            type: 'array',
            hidden: true,
            fields: [
                {
                    name: 'messageId',
                    type: 'text'
                }
            ]
        }
    ],
    versions: {
        drafts: true
    }
}

export default Announcements;