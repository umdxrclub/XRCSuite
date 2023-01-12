import { CollectionConfig } from "payload/types";
import { defaultValueSchemable } from "sequelize/types/utils";
import LatestStatEndpoint from "../endpoints/Stats/LatestStat";
import RefreshStatsEndpoint from "../endpoints/Stats/RefreshStats";
import { CollectionSlugs } from "../slugs";

const Stats: CollectionConfig = {
    slug: CollectionSlugs.Stats,
    admin: {
        group: "Audit",
        useAsTitle: 'date'
    },
    endpoints: [ LatestStatEndpoint, RefreshStatsEndpoint ],
    fields: [
        {
            name: 'date',
            type: 'date',
            defaultValue: () => new Date()
        },
        {
            name: 'count',
            type: 'group',
            fields: [
                {
                    name: 'discord',
                    type: 'number',
                    defaultValue: 0
                },
                {
                    name: 'terplink',
                    type: 'number',
                    defaultValue: 0
                },
                {
                    name: 'youtube',
                    type: 'number',
                    defaultValue: 0
                },
                {
                    name: 'instagram',
                    type: 'number',
                    defaultValue: 0
                },
                {
                    name: 'twitter',
                    type: 'number',
                    defaultValue: 0
                }
            ]
        }
    ]
}

export default Stats;