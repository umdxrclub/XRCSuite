import { CollectionConfig } from "payload/types";
import AuditMessagesHook from "../endpoints/Attendance/AuditMessages";
import { CollectionSlugs } from "../slugs";
import Events from "./Events";
import Members from "./Members";

const Attendances: CollectionConfig = {
    slug: CollectionSlugs.Attendances,
    admin: {
        useAsTitle: 'member',
        group: "Audit",
        defaultColumns: [ 'member', 'date', 'event', 'type' ],
    },
    hooks: {
        afterChange: [ AuditMessagesHook ]
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
            type: 'radio',
            options: [
                {
                    label: 'In',
                    value: 'in'
                },
                {
                    label: 'Out',
                    value: 'out'
                }
            ]
        }
    ]
}

export default Attendances;