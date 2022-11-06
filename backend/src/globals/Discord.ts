import { GlobalConfig } from "payload/types";
import Members from "../collections/Members";

const Discord: GlobalConfig = {
    slug: 'discord',
    fields: [
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
            name: 'guilds',
            type: 'array',
            fields: [
                {
                    name: 'guildId',
                    type: 'text'
                }
            ]
        }
    ]
};

export default Discord;