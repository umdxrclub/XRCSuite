import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Media: CollectionConfig = {
    slug: CollectionSlugs.Media,
    fields: [],
    upload: {
        staticURL: '/media',
        staticDir: 'media',
        mimeTypes: ['image/*']
    },
}

export default Media;