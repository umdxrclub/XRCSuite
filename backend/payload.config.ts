import path from 'path';
import { buildConfig } from 'payload/config';
import Devices from './src/collections/Devices'
import Members from './src/collections/Members'
import Leadership from './src/collections/Leadership'
import Users from './src/collections/Users'
import Events from './src/collections/Events'
import Attendances from './src/collections/Attendances'
import Lab from './src/globals/Lab'
import Discord from './src/globals/Discord'
import CAS from './src/globals/CAS'

export default buildConfig({
    admin: {
        user: Users.slug,
    },
    collections: [
        Devices,
        Members,
        Leadership,
        Events,
        Attendances,
        Users
    ],
    globals: [
        Lab,
        Discord,
        CAS
    ],
    typescript: {
        outputFile: path.resolve(__dirname, 'payload-types.ts'),
    },
    graphQL: {
        schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
    },
});