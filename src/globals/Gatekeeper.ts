import { GlobalConfig } from "payload/types";
import { CollectionSlugs, GlobalSlugs } from "../slugs";

const Gatekeeper: GlobalConfig = {
    slug: GlobalSlugs.Gatekeeper,
    fields: [
        {
            name: "acceptSound",
            type: "upload",
            relationTo: CollectionSlugs.Media,
            filterOptions: {
                mimeType: { contains: 'audio' }
            }
        },
        {
            name: "rejectSound",
            type: "upload",
            relationTo: CollectionSlugs.Media,
            filterOptions: {
                mimeType: { contains: 'audio' }
            }
        }
    ]
}

export default Gatekeeper;