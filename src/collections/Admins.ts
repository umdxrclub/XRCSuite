import { CollectionConfig } from 'payload/types';
import { CollectionSlugs } from '../slugs';

const Admins: CollectionConfig = {
  slug: CollectionSlugs.Admins,
  auth: {
    tokenExpiration: 999999999,
    useAPIKey: true
  },
  admin: {
    useAsTitle: 'email',
    group: 'Users',
  },
  access: {
    read: allowIfAdmin,
  },
  fields: [
    {
      name: "casManager",
      defaultValue: false,
      type: 'checkbox',
      label: "CAS Manager",
      admin: {
        description: "The CAS Manager has sole access to the CAS global which contains credentials for authenticating with a UMD account. Once a CAS Manager is set, only the CAS Manager can designate someone else as a CAS Manager."
      },
      access: {
        update: async (args) => {
          let isCasManager = args.data?.casManager;
          if (isCasManager)
            return true;

          let managers = await args.req.payload.find({
            collection: "admins",
            where: {
              casManager: {
                equals: true
              }
            }
          })

          return managers.totalDocs == 0;
        }
      }
    }
  ],
};

export default Admins;

export function allowIfAdmin(args: { req: { user: any }}) {
  return args.req.user && args.req.user.collection == Admins.slug
}