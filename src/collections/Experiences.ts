import { CollectionConfig } from "payload/types";

export const Experiences: CollectionConfig = {
    slug: "experiences",
    fields: [
        {
            name: "name",
            type: "text",
            required: true
        },
        {
            name: "description",
            type: "textarea"
        }
    ]
}