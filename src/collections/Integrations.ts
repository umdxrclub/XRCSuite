import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Integrations: CollectionConfig = {
    slug: CollectionSlugs.Integrations,
    admin: {
        useAsTitle: 'name'
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'discordEmoji',
            type: 'text'
        }
    ],
    timestamps: false
}

export default Integrations;