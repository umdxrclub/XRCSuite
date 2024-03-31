import { CollectionConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Articles: CollectionConfig = {
  slug: CollectionSlugs.Articles,
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
        name: "authors",
        type: "relationship",
        relationTo: CollectionSlugs.Members,
        hasMany: true
    },
    {
      name: "content",
      type: "richText",
    },
  ],
  admin: {
    useAsTitle: "title"
  },
  versions: true
};

export default Articles;