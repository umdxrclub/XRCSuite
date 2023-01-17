import { GlobalConfig } from "payload/types";
import Events from "../collections/Events";
import Members, { LeadershipRoles } from "../collections/Members";
import Schedules from "../collections/Schedules";
import LabColorPicker from "../components/lab/LabColorPicker";
import LabCheckIn from "../endpoints/Lab/LabCheckIn";
import LabStatusEndpoint from "../endpoints/Lab/LabStatus";
import LabStatusHook from "../hooks/Lab/LabStatus";

const Lab: GlobalConfig = {
    slug: 'lab',
    endpoints: [ LabCheckIn, LabStatusEndpoint ],
    hooks: {
        afterChange: [ LabStatusHook ]
    },
    fields: [
        {
            name: 'open',
            type: 'checkbox',
            defaultValue: false
        },
        {
            name: 'event',
            type: 'relationship',
            relationTo: Events.slug
        },
        {
            name: 'members',
            type: 'relationship',
            relationTo: Members.slug,
            hasMany: true,
        },
        {
            name: 'schedule',
            type: 'relationship',
            relationTo: Schedules.slug
        },
        {
            name: 'odoo',
            type: 'group',
            fields: [
                {
                    name: 'contractId',
                    type: 'number'
                }
            ]
        },
        {
            name: 'settings',
            type: 'group',
            fields: [
                {
                    type: 'ui',
                    name: 'color',
                    admin: {
                        components: {
                            Field: LabColorPicker
                        }
                    }
                },
                {
                    type: 'checkbox',
                    name: 'notifyStatus',
                    label: "Send a notification when the XR Lab opens/closes"
                },
                {
                    type: 'checkbox',
                    name: 'notifyLeadershipCheckInOut',
                    label: "Send a notification when a leadership member enters/exits the XR Lab",
                    admin: {
                        description: "This notification is only sent while the XR Lab is open."
                    }
                },
                {
                    type: 'select',
                    name: 'leadershipRolesToNotify',
                    label: "Leadership Roles to Announce",
                    options: LeadershipRoles,
                    hasMany: true,
                    admin: {
                        description: "A leadership check in/out notification will only be sent if the member has one of these roles."
                    }
                }
            ]
        }
    ]
};

export default Lab;