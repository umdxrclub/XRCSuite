import { Field, GlobalConfig } from "payload/types";
import createDiscordMessageField from "../blocks/messages";
import { createActionButton } from "../components/ActionButton";
import DiscordUserEndpoint from "../endpoints/Discord/DiscordUserEndpiont";
import GuildStatsEndpoint from "../endpoints/Discord/GuildStats";
import RegisterSlashCommandsEndpoint from "../endpoints/Discord/RegisterSlashCommands";
import BotUpdateHook from "../hooks/Bot/BotUpdateHook";
import DefaultRoleChangedHook from "../hooks/Bot/DefaultRoleHook";
import GetStartedMessageChanged from "../hooks/Bot/GetStartedMessageHook";
import { CollectionSlugs, GlobalSlugs } from "../slugs";
import { ChannelType, StatusChannelType, XRClubDiscordNotificationRoles } from "../types/XRCTypes";

const Bot: GlobalConfig = {
    slug: GlobalSlugs.Discord,
    admin: {
        group: 'Discord'
    },
    endpoints: [ RegisterSlashCommandsEndpoint, GuildStatsEndpoint, DiscordUserEndpoint ],
    fields: [
        {
            name: 'enabled',
            type: 'checkbox',
            hooks: {
                afterChange: [BotUpdateHook]
            }
        },
        {
            name: 'registerCommands',
            type: 'ui',
            admin: {
                components: {
                    Field: createActionButton({ title: "Register Slash Commands", postUrl: "/api/globals/bot/registerCommands" })
                }
            }
        },
        {
            name: 'auth',
            type: 'group',
            fields: [
                {
                    name: 'clientId',
                    type: 'text'
                },
                {
                    name: 'clientSecret',
                    type: 'text'
                },
                {
                    name: 'token',
                    type: 'text'
                }
            ]
        },
        {
            name: 'media',
            type: 'group',
            fields: [
                {
                    name: "banner",
                    type: "upload",
                    relationTo: CollectionSlugs.Media,
                    filterOptions: {
                        mimeType: { contains: 'image' }
                    }
                }
            ]
        },
        {
            name: "getStartedMessage",
            type: "relationship",
            relationTo: CollectionSlugs.Messages,
            hooks: {
                afterChange: [ GetStartedMessageChanged ]
            }
        },
        {
            name: 'guild',
            type: 'group',
            fields: [
                {
                    name: 'guildId',
                    type: 'text'
                },
                {
                    name: 'channels',
                    type: 'group',
                    fields: ChannelType.map(ct => ({
                        name: ct.value,
                        label: ct.label,
                        type: 'text'
                    }))
                },
                {
                    name: 'statusChannels',
                    type: 'group',
                    fields: StatusChannelType.map(o => createStatusChannelField(o.value,o.label))
                },
                {
                    name: 'defaultRole',
                    type: 'relationship',
                    relationTo: CollectionSlugs.Roles,
                    hooks: {
                        afterChange: [ DefaultRoleChangedHook ]
                    },
                    filterOptions: {
                        discordRoleId: {
                            not_equals: undefined
                        }
                    }
                },
                {
                    name: 'notificationRoles',
                    type: 'group',
                    fields: XRClubDiscordNotificationRoles.map(r => ({
                        name: r.name,
                        type: 'relationship',
                        label: r.title,
                        relationTo: CollectionSlugs.Roles
                    }))
                }
            ]
        }
    ]
};

function createStatusChannelField(name: string, label: string): Field {
    return {
        name: name,
        label: label,
        type: 'group',
        fields: [
            {
                name: 'channelId',
                type: 'text'
            },
            {
                name: 'messages',
                type: 'array',
                fields: [
                    {
                        name: 'messageId',
                        type: 'text',
                        required: true
                    }
                ]
            }
        ]
    }
}

export default Bot;