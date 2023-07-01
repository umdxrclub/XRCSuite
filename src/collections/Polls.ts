import { CollectionConfig } from "payload/types";
import { createDiscordChannelField } from "../fields/discord/ChannelField";
import { createDiscordMemberField } from "../fields/discord/MemberField";
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
            type: 'text',
            required: true
        },
        {
            name: 'open',
            type: 'checkbox',
            defaultValue: true,
            required: true
        },
        {
            name: 'allowRevote',
            type: 'checkbox',
            defaultValue: true
        },
        createDiscordMemberField({
            name: "author",
            index: true,
            required: true
        }),
        {
            name: 'messages',
            type: 'array',
            fields: [
                createDiscordChannelField({
                    name: 'channel',
                    required: true
                }),
                {
                    name: 'msg',
                    type: 'text',
                    required: true
                }
            ]
        },
        {
            name: 'choices',
            type: 'array',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true
                },
                {
                    name: 'voters',
                    type: 'array',
                    fields: [
                        createDiscordMemberField({
                            name: "id",
                            required: true
                        })
                    ]
                }
            ]
        }
    ]
}

export default Polls;