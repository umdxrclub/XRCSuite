import { GlobalConfig } from "payload/types";
import { createActionButton } from "../components/ActionButton";
import { XRClubDiscordRoles } from "../types/XRCTypes";
import GuildStatsEndpoint from "../endpoints/Discord/GuildStats";
import RegisterSlashCommandsEndpoint from "../endpoints/Discord/RegisterSlashCommands";
import BotUpdateHook from "../hooks/Bot/BotUpdateHook";
import { GlobalSlugs } from "../slugs";

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
                    fields: [
                        {
                            name: 'announcements',
                            type: 'text'
                        },
                        {
                            name: 'notifications',
                            type: 'text',
                        },
                        {
                            name: 'audit',
                            type: 'text'
                        },
                        {
                            name: 'events',
                            type: 'text'
                        }
                    ]
                },
                {
                    name: 'roles',
                    type: 'group',
                    fields: XRClubDiscordRoles.map(r => ({
                        name: r.name,
                        type: 'text',
                        label: r.title
                    }))
                }
            ]
        }
    ]
};

export default Bot;