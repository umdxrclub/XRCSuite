import { CollectionConfig } from "payload/types";
import UpdatedPollMessageHook from "../hooks/Polls/UpdatePollMessage";
import { CollectionSlugs } from "../slugs";

const Polls: CollectionConfig = {
    slug: CollectionSlugs.Polls,
    admin: {
        group: "Discord",
        useAsTitle: 'title'
    },
    hooks: {
        afterChange: [ UpdatedPollMessageHook ]
    },
    fields: [
        {
            name: 'title',
            type: 'text'
        },
        {
            name: 'open',
            type: 'checkbox',
            defaultValue: true
        },
        {
            name: 'allowRevote',
            type: 'checkbox',
            defaultValue: true
        },
        {
            name: 'author',
            index: true,
            type: 'text'
        },
        {
            name: 'messages',
            type: 'array',
            fields: [
                {
                    name: 'channel',
                    type: 'text',
                },
                {
                    name: 'msg',
                    type: 'text'
                }
            ]
        },
        {
            name: 'choices',
            type: 'array',
            fields: [
                {
                    name: 'name',
                    type: 'text'
                },
                {
                    name: 'voters',
                    type: 'array',
                    fields: [
                        {
                            name: 'id',
                            type: 'text'
                        }
                    ]
                }
            ]
        }
    ]
}

export default Polls;