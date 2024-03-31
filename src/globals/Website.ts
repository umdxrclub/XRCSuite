import { GlobalConfig } from "payload/types";
import { CollectionSlugs } from "../slugs";

const Website: GlobalConfig = {
  slug: "website",
  fields: [
    {
      name: "members",
      type: "array",
      fields: [
        {
          type: "relationship",
          name: "member",
          relationTo: CollectionSlugs.Members,
          required: true,
        },
      ],
    },
    {
      name: "legacyMembers",
      type: "array",
      fields: [
        {
          type: "relationship",
          name: "member",
          relationTo: CollectionSlugs.Members,
          required: true,
        },
      ],
    },
  ],
};

export default Website;
