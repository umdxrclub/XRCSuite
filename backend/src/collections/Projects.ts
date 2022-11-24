import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";
import Media from "./Media";
import Members from "./Members";

const Projects: CollectionConfig = {
    slug: CollectionSlugs.Projects,
    admin: {
        useAsTitle: 'name'
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'leads',
            type: 'relationship',
            relationTo: Members.slug,
            hasMany: true
        },
        {
            name: 'banner',
            type: 'upload',
            relationTo: Media.slug
        },
        {
            name: 'gallery',
            type: 'array',
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: Media.slug
                },
                {
                    name: 'description',
                    type: 'text'
                }
            ]
        },
        {
            name: 'startDate',
            type: 'date'
        },
        {
            name: 'endDate',
            type: 'date'
        },
        {
            name: 'description',
            type: 'richText'
        }
    ]
}

export default Projects;