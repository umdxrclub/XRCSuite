import path from 'path';
import { buildConfig } from 'payload/config';
import Devices from './src/collections/Devices'
import Members from './src/collections/Members'
import Leadership from './src/collections/Leadership'
import Users from './src/collections/Users'
import Events from './src/collections/Events'
import Attendances from './src/collections/Attendances'
import Heartbeats from './src/collections/Heartbeats'
import Lab from './src/globals/Lab'
import Discord from './src/globals/Discord'
import CAS from './src/globals/CAS'
import UMDLoginButton from './src/components/UMDLoginButton'
import XRCLogo from './src/components/XRCLogo'

export default buildConfig({
    admin: {
        user: Users.slug,
        components: {
            afterLogin: [UMDLoginButton],
            graphics: {
                Icon: XRCLogo
            }
        },
        webpack: (config) => ({
            ...config,
            resolve: {
                ...config.resolve,
                fallback: {
                    ...config.resolve?.fallback,
                    util: require.resolve('util')
                }
            }
        }),
    },
    cors: '*',
    collections: [
        Users,
        Members,
        Leadership,
        Devices,
        Heartbeats,
        Events,
        Attendances
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