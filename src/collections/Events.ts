import ImportEventsEndpoint from "../endpoints/Events/ImportTerpLinkEvents";
import { CollectionConfig } from "payload/types";
import { EventThumbnail } from "../components/EventThumbnail";
import EventCheckIn from "../endpoints/Events/EventCheckIn";
import { CollectionSlugs } from "../slugs";
import { createActionButton } from "../components/ActionButton";
import AnnounceEventEndpoint from "../endpoints/Events/AnnounceEvent";
import { XRClubEventTypes } from "../data/XRCTypes";
import CreateDiscordEventEndpoint from "../endpoints/Events/CreateDiscordEvent";

const Events: CollectionConfig = {
    slug: CollectionSlugs.Events,
    admin: {
        useAsTitle: 'name',
        defaultColumns: [ 'name', 'startDate', 'endDate' ],
    },
    endpoints: [ ImportEventsEndpoint, EventCheckIn, AnnounceEventEndpoint, CreateDiscordEventEndpoint ],
    fields: [
        {
            name: 'announceEvent',
            type: 'ui',
            admin: {
                components: {
                    Field: createActionButton({ title: "Announce Event", postUrl: "/api/events/:id/announce" })
                }
            }
        },
        {
            name: 'createGuildEvent',
            type: 'ui',
            admin: {
                components: {
                    Field: createActionButton({ title: "Create Discord Event", postUrl: "/api/events/:id/discord-event" })
                }
            }
        },
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
            name: 'type',
            type: 'select',
            options: XRClubEventTypes
        },
        {
            name: 'location',
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
        }
    ]
}

export default Events;