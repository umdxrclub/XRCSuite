import { CollectionConfig } from "payload/types";

export const Opportunities: CollectionConfig = {
    slug: "opportunities",
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
        {
            name: "url",
            type: "text"
        },
        {
            name: "description",
            type: "textarea"
        }
    ]
}