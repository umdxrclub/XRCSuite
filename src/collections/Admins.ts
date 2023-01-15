import { CollectionConfig } from 'payload/types';
import { CollectionSlugs } from '../slugs';

const Admins: CollectionConfig = {
  slug: CollectionSlugs.Admins,
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Users',
  },
  access: {
    read: allowIfAdmin,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
};

export default Admins;

export function allowIfAdmin(args: { req: { user: any }}) {
  return args.req.user && args.req.user.collection == Admins.slug
}