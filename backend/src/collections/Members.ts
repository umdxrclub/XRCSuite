import { CollectionConfig } from "payload/types";

const Members: CollectionConfig = {
    slug: 'members',
    admin: {
        useAsTitle: 'name'
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'email',
            type: 'text',
        },
        {
            name: 'UMD',
            type: 'group',
            fields: [
                {
                    name: 'directoryId',
                    type: 'text'
                },
                {
                    name: 'cardSerial',
                    type: 'text'
                },
                {
                    name: 'terplinkAccountId',
                    type: 'text'
                },
                {
                    name: 'terplinkIssuanceId',
                    type: 'text'
                }
            ]
        },
        {
            name: 'integrations',
            type: 'group',
            fields: [
                {
                    name: 'discord',
                    type: 'text'
                },
                {
                    name: 'oculus',
                    type: 'text'
                },
                {
                    name: 'steam',
                    type: 'text'
                },
                {
                    name: 'scoresaber',
                    type: 'text'
                }
            ]
        }
    ]
}

export default Members;