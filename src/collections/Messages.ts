import { CollectionConfig } from "payload/types";
import createDiscordMessageField from "../blocks/messages";
import IgnoreExternalChangesHook from "../hooks/Messages/IgnoreExternalChangesHook";
import DeleteMessageHook from "../hooks/Messages/DeleteMessageHook";
import UpdateMessageHook from "../hooks/Messages/UpdateMessageHook";
import { CollectionSlugs } from "../slugs";
import { createDiscordChannelField } from "../fields/discord/ChannelField";
import { useAsRowTitle } from "../payload";

const Messages: CollectionConfig = {
    slug: CollectionSlugs.Messages,
    admin: {
        useAsTitle: 'name',
        group: 'Discord'
    },
    hooks: {
        afterDelete: [ DeleteMessageHook ],
        afterChange: [ UpdateMessageHook ]
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true
        },
        {
            name: 'useMessageContent',
            type: 'checkbox',
            defaultValue: true,
            required: true
        },
        createDiscordMessageField({
            name: 'content',
            admin: {
                condition: data => data.useMessageContent
            }
        }),
        {
            name: 'channels',
            type: 'array',
            fields: [
                createDiscordChannelField({
                    name: 'channelId',
                    required: true
                }),
                {
                    name: 'alwaysResendMessages',
                    type: 'checkbox',
                    defaultValue: false,
                    required: true
                },
                {
                    name: 'messages',
                    type: 'array',
                    hidden: true,
                    fields: [
                        {
                            name: 'messageId',
                            type: 'text',
                            required: true
                        }
                    ],
                    hooks: {
                        beforeChange: [ IgnoreExternalChangesHook ]
                    }
                }
            ]
        },
        {
            name: "publish",
            type: "checkbox",
            hidden: true,
            defaultValue: false
        }
    ]
}

export default Messages;