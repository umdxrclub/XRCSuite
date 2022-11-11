import { CollectionConfig } from "payload/types";
import ActionList from "../components/ActionList";

const Events: CollectionConfig = {
    slug: 'events',
    admin: {
        useAsTitle: 'name',
        components: {
            views: {
                List: ActionList
            }
        }
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