import { GlobalConfig } from "payload/types";
import { createPostActionButton } from "../components/PostActionButton";
import DiscordUserEndpoint from "../endpoints/Discord/DiscordUserEndpiont";
import GuildStatsEndpoint from "../endpoints/Discord/GuildStats";
import RegisterSlashCommandsEndpoint from "../endpoints/Discord/RegisterSlashCommands";
import { createDiscordChannelField } from "../fields/discord/ChannelField";
import { createDiscordRoleField } from "../fields/discord/RoleField";
import BotUpdateHook from "../hooks/Bot/BotUpdateHook";
import DefaultRoleChangedHook from "../hooks/Bot/DefaultRoleHook";
import { CollectionSlugs, GlobalSlugs } from "../slugs";
import { ChannelType, XRClubDiscordNotificationRoles } from "../types/XRCTypes";

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
                    Field: createPostActionButton({ title: "Register Slash Commands", postUrl: "/api/globals/bot/registerCommands" })
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
                    fields: ChannelType.map(ct => createDiscordChannelField({
                        name: ct.value,
                        label: ct.label
                    }, [0,5]))
                },
                createDiscordRoleField({
                    name: 'defaultRole',
                    hooks: {
                        afterChange: [ DefaultRoleChangedHook ]
                    },
                }),
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
            name: "processDms",
            type: "checkbox",
            required: true,
            defaultValue: false,
            admin: {
                description: "If checked, the bot will process interactions for all direct messages."
            }
        }
    ]
};

export default Bot;