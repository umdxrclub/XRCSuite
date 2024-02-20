import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Carousels: CollectionConfig = {
    slug: "carousels",
    admin: {
        useAsTitle: "name"
    },
    fields: [
        {
            name: "name",
            type: "text",
            required: true
        },
        {
            name: "interval",
            type: "number",
            required: true,
            defaultValue: 15
        },
        {
            name: "slides",
            type: "blocks",
            blocks: [
                {
                    slug: "imageAndText",
                    fields: [
                        {
                            name: "title",
                            type: "text"
                        },
                        {
                            name: "text",
                            type: "textarea"
                        },
                        {
                            name: "image",
                            type: "upload",
                            relationTo: CollectionSlugs.Media
                        },
                        {
                            name: "fit",
                            type: "select",
                            required: true,
                            defaultValue: "cover",
                            options: ["cover", "contain"]
                        }
                    ]
                }
            ],
            required: true
        }
    ]
}

export default Carousels;