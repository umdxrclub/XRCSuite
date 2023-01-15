import { CollectionConfig } from "payload/types";
import AuditMessagesHook from "../hooks/Attendance/AuditMessages";
import TerpLinkAttendanceHook from "../hooks/Attendance/TerpLinkAttendance";
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
        afterChange: [ AuditMessagesHook, TerpLinkAttendanceHook ]
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
            defaultValue: new Date().toString()
        },
        {
            name: 'event',
            type: 'relationship',
            relationTo: Events.slug
        },
        {
            name: 'type',
            type: 'radio',
            defaultValue: "in",
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