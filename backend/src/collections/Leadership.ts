import { CollectionConfig } from "payload/types";
import Members from "./Members";

const CLUB_ROLES: string[] = [
    "President",
    "Vice President",
    "Treasurer",
    "Engagement Director",
    "Lab Manager",
    "Mentor",
    "Graphic Designer",
    "Event Coordinator",
    "Web Developer",
    "Marketing Director"
]

const Leadership: CollectionConfig = {
    slug: 'leadership',
    labels: {
        singular: 'Leadership',
        plural: 'Leadership'
    },
    admin: {
        useAsTitle: 'member'
    },
    fields: [
        {
            name: 'member',
            type: 'relationship',
            relationTo: Members.slug,
            unique: true
        },
        {
            name: 'roles',
            type: 'select',
            options: CLUB_ROLES,
            hasMany: true
        }
    ]
}

export default Leadership;