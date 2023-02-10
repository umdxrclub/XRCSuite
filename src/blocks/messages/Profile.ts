import { Block } from "payload/types";
import { CollectionSlugs } from "../../slugs";

const Profile: Block = {
    slug: "profile",
    fields: [
        {
            name: 'member',
            type: 'relationship',
            relationTo: CollectionSlugs.Members
        }
    ]
}

export default Profile;