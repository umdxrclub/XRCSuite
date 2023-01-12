import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";
import Media from "./Media";
import Members from "./Members";

const ProjectStatus: string[] = [
    "Proposed",
    "Active",
    "Inactive",
    "Finished"
]

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
            name: 'status',
            type: 'select',
            options: ProjectStatus,
            defaultValue: ProjectStatus[0]
        },
        {
            name: 'projectLeads',
            type: 'relationship',
            relationTo: Members.slug,
            hasMany: true,
            admin: {
                description: "The club members who are leading the development of the project."
            }
        },
        {
            name: 'members',
            type: 'relationship',
            relationTo: Members.slug,
            hasMany: true,
            admin: {
                description: "All club members who are involved with this project."
            }
        },
        {
            name: 'logo',
            type: 'upload',
            relationTo: Media.slug
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