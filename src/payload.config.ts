
import path from 'path';
import { buildConfig } from 'payload/config';
import Devices from './collections/Devices'
import Members from './collections/Members'
import Admins from './collections/Admins'
import Events from './collections/Events'
import Attendances from './collections/Attendances'
import Heartbeats from './collections/Heartbeats'
import Lab from './globals/Lab'
import Bot from './globals/Discord'
import Wishlist from './globals/Wishlist'
import CAS from './globals/CAS'
import XRCLogo from './components/XRCLogo'
import Descriptions from './collections/Descriptions'
import Announcements from './collections/Announcements'
import Software from './collections/Software'
import Projects from './collections/Projects'
import Media from './collections/Media'
import Schedules from './collections/Schedules'
import Polls from './collections/Polls'
import Gatekeeper from './globals/Gatekeeper'
import GatekeeperRoute from './routes/Gatekeeper';
import XRCBeforeDashboard from './components/dashboard/XRCBeforeDashboard';
import Stats from './collections/Stats';

const fallbackModules = [
    'util',
]

const aliasDirectories = [
    './endpoints/',
    './util/',
    './hooks/',
    './discord/',
    './ws/'
]

const emptyObjPath = path.resolve(__dirname, './mocks/EmptyObject.ts')

export default buildConfig({
    admin: {
        user: Admins.slug,
        components: {
            beforeDashboard: [ XRCBeforeDashboard ],
            graphics: {
                Icon: XRCLogo
            },
            routes: [
                GatekeeperRoute
            ]
        },
        webpack: (config) => {
            let { walkDirectory } = require('./util/directory')

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
                },
                module: {
                    ...config.module,
                    rules: [
                        ...config.module?.rules,
                        {
                            test: /\.svg$/,
                            use: ['@svgr/webpack']
                        }
                    ]
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
        Polls,
        Stats
    ],
    globals: [
        Lab,
        Bot,
        CAS,
        Wishlist,
        Gatekeeper
    ],
    typescript: {
        outputFile: path.resolve(__dirname, './types/PayloadSchema.ts'),
    },
    // graphQL: {
    //     schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
    // },
    graphQL: {
        disable: true,
    },
});