import { CollectionConfig } from 'payload/types';

const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: allowIfAdmin,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
};

export default Users;

export function allowIfAdmin(args: { req: { user: any }}) {
  return args.req.user && args.req.user.collection == Users.slug
} 