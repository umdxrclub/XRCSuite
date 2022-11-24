import path from 'path';
import { buildConfig } from 'payload/config';
import Devices from './src/collections/Devices'
import Members from './src/collections/Members'
import Admins from './src/collections/Admins'
import Events from './src/collections/Events'
import Attendances from './src/collections/Attendances'
import Heartbeats from './src/collections/Heartbeats'
import Lab from './src/globals/Lab'
import Bot from './src/globals/Discord'
import Wishlist from './src/globals/Wishlist'
import CAS from './src/globals/CAS'
import XRCLogo from './src/components/XRCLogo'
import Descriptions from './src/collections/Descriptions'
import Announcements from './src/collections/Announcements'
import Software from './src/collections/Software'
import Projects from './src/collections/Projects'
import Media from './src/collections/Media'
import Schedules from './src/collections/Schedules'
import Guilds from './src/collections/Guilds'

const fallbackModules = [
    'util',
]

const aliasDirectories = [
    'src/endpoints/',
    'src/util/',
    'src/hooks/'
]

const emptyObjPath = path.resolve(__dirname, 'src/mocks/EmptyObject.ts')

export default buildConfig({
    admin: {
        user: Admins.slug,
        components: {
            graphics: {
                Icon: XRCLogo
            }
        },
        webpack: (config) => {
            let { walkDirectory } = require('./src/util/directory')

            let aliasFiles = aliasDirectories.reduce((arr, dir) => {
                let dirPath = path.resolve(__dirname, dir)
                let files = walkDirectory(dirPath, ".ts")
                return [...arr, ...files];
            }, [] as string[]);

            let newConfig = {
                ...config,
                resolve: {
                    ...config.resolve,
                    fallback: {
                        ...config.resolve?.fallback,
                        ...fallbackModules.reduce((a, m) => { a[m] = false; return a; }, {})
                    },
                    alias: {
                        ...config.resolve?.alias,
                        ...aliasFiles.reduce((a, f) => { a[f] = emptyObjPath; return a }, {})
                    }
                }
            };

            return newConfig;
        },
    },
    cors: '*',
    collections: [
        Admins,
        Members,
        Devices,
        Heartbeats,
        Attendances,
        Events,
        Descriptions,
        Announcements,
        Software,
        Projects,
        Media,
        Schedules,
        Guilds
    ],
    globals: [
        Lab,
        Bot,
        CAS,
        Wishlist
    ],
    typescript: {
        outputFile: path.resolve(__dirname, '../shared/payload-types.ts'),
    },
    graphQL: {
        schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
    },
});