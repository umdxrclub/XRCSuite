import { Field, GlobalConfig } from "payload/types";
import { createActionButton } from "../components/ActionButton";
import GuildStatsEndpoint from "../endpoints/Discord/GuildStats";
import RegisterSlashCommandsEndpoint from "../endpoints/Discord/RegisterSlashCommands";
import BotUpdateHook from "../hooks/Bot/BotUpdateHook";
import { CollectionSlugs, GlobalSlugs } from "../slugs";
import { ChannelType, XRClubDiscordNotificationRoles } from "../types/XRCTypes";

const Bot: GlobalConfig = {
    slug: GlobalSlugs.Discord,
    admin: {
        group: 'Discord'
    },
    endpoints: [ RegisterSlashCommandsEndpoint, GuildStatsEndpoint ],
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
        },
        {
            name: 'bulkMessages',
            type: 'group',
            fields: ["lab", "leadership", "inventory"].map(createBulkMessagesField)
        }
    ]
};

function createBulkMessagesField(name: string): Field {
    return {
        name: name,
        type: 'array',
        fields: [
            {
                name: 'messageId',
                type: 'text',
                required: true
            }
        ],
        defaultValue: []
    }
}

export default Bot;