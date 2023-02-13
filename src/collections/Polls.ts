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
        createDiscordMemberField({
            name: "author",
            index: true
        }),
        {
            name: 'messages',
            type: 'array',
            fields: [
                createDiscordChannelField({
                    name: 'channel'
                }),
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
                        createDiscordMemberField({
                            name: "id"
                        })
                    ]
                }
            ]
        }
    ]
}

export default Polls;