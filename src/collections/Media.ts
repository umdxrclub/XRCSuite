import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Media: CollectionConfig = {
    slug: CollectionSlugs.Media,
    access: {
        read: (args) => {
            if (args.req.user) {
                return true;
            }

            return {
                isPublic: {
                    equals: true
                }
            }
        }
    },
    fields: [
        {
            name: 'isPublic',
            type: 'checkbox',
            defaultValue: true
        }
    ],
    upload: {
        staticURL: '/media',
        staticDir: '../media',
        mimeTypes: ['image/*', 'audio/*']
    },
}

export default Media;