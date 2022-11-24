import ImportEventsEndpoint from "../endpoints/Events/ImportTerpLinkEvents";
import { CollectionConfig } from "payload/types";
import { EventThumbnail } from "../components/EventThumbnail";
import EventCheckIn from "../endpoints/Events/EventCheckIn";
import { CollectionSlugs } from "../slugs";

const Events: CollectionConfig = {
    slug: CollectionSlugs.Events,
    admin: {
        useAsTitle: 'name',
        defaultColumns: [ 'name', 'startDate', 'endDate' ],
    },
    endpoints: [ ImportEventsEndpoint, EventCheckIn ],
    fields: [
        {
            type: 'collapsible',
            label: 'Thumbnail',
            fields: [
                {
                    type: 'ui',
                    name: 'thumbnail',
                    admin: {
                        components: {
                            Field: EventThumbnail
                        }
                    }
                },
            ]
        },
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
            name: 'imageUrl',
            type: 'text'
        },
        {
            name: 'description',
            type: 'textarea'
        },
        {
            name: 'terplink',
            type: 'group',
            fields: [
                {
                    name: 'eventId',
                    type: 'text',
                    index: true
                },
                {
                    name: 'accessCode',
                    type: 'text',
                    index: true
                }
            ]
        },
        {
            name: 'discord',
            type: 'group',
            fields: [
                {
                    name: 'eventId',
                    type: 'text'
                },
                {
                    name: 'messageId',
                    type: 'text'
                }
            ],
            hidden: true
        }
    ]
}

export default Events;