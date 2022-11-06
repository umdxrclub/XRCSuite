import { CollectionConfig } from "payload/types";

const Events: CollectionConfig = {
    slug: 'events',
    admin: {
        useAsTitle: 'name'
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'startDate',
            type: 'date'
        },
        {
            name: 'endDate',
            type: 'date'
        },
        {
            name: 'terplink',
            type: 'group',
            fields: [
                {
                    name: 'id',
                    type: 'text'
                },
                {
                    name: 'accessCode',
                    type: 'text'
                }
            ]
        }
    ]
}

export default Events;