import { GlobalConfig } from "payload/types";
import Events from "../collections/Events";
import Members from "../collections/Members";
import Schedules from "../collections/Schedules";
import LabCheckIn from "../endpoints/Lab/LabCheckIn";

const Lab: GlobalConfig = {
    slug: 'lab',
    endpoints: [ LabCheckIn ],
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
            type: 'relationship',
            relationTo: Members.slug,
            hasMany: true
        },
        {
            name: 'schedule',
            type: 'relationship',
            relationTo: Schedules.slug
        }
    ]
};

export default Lab;