import { Block, CollectionConfig, Field } from "payload/types";
import { CollectionSlugs } from "../slugs";
import Members from "./Members";

const TimeSlotFields: Field[] = [
    {
        name: 'day',
        type: 'select',
        options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    {
        name: 'allday',
        type: 'checkbox',
    },
    {
        name: 'from',
        type: 'text',
        admin: {
            condition: (data, siblingData) => !siblingData.allday
        }
    },
    {
        name: 'to',
        type: 'text',
        admin: {
            condition: (data, siblingData) => !siblingData.allday
        }
    }
]

const ClosingBlock: Block = {
    slug: 'Closing',
    fields: [
        ...TimeSlotFields,
        {
            name: 'reason',
            type: 'text'
        }
    ]
}

const OpeningBlock: Block = {
    slug: 'Opening',
    fields: [
        ...TimeSlotFields,
        {
            name: 'staff',
            type: 'relationship',
            relationTo: Members.slug,
            hasMany: true
        }
    ]
}

const Schedules: CollectionConfig = {
    slug: CollectionSlugs.Schedules,
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'time',
            label: "Time Slots",
            type: 'blocks',
            blocks: [ ClosingBlock, OpeningBlock ]
        }
    ]
}

export default Schedules