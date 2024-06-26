import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from "path";
import { buildConfig } from "payload/config";
import Admins from "./collections/Admins";
import Attendances from "./collections/Attendances";
import Carousels from "./collections/Carousels";
import Descriptions from "./collections/Descriptions";
import Devices from "./collections/Devices";
import Events from "./collections/Events";
import { Experiences } from "./collections/Experiences";
import Heartbeats from "./collections/Heartbeats";
import Media from "./collections/Media";
import Members from "./collections/Members";
import Messages from "./collections/Messages";
import { Opportunities } from "./collections/Opportunities";
import Polls from "./collections/Polls";
import Projects from "./collections/Projects";
import Roles from "./collections/Roles";
import Schedules from "./collections/Schedules";
import Software from "./collections/Software";
import Stats from "./collections/Stats";
import XRCLogo from "./components/XRCLogo";
import XRCBeforeDashboard from "./components/dashboard/XRCBeforeDashboard";
import LabTV from './components/lab/LabTV';
import DiscordGuildProvider from "./components/providers/DiscordGuildProvider";
import { MUIThemeProvider } from "./components/providers/ThemeProvider";
import XRCStatusProvider from "./components/providers/XRCStatusProvider";
import CAS from "./globals/CAS";
import Bot from "./globals/Discord";
import GApi from "./globals/GApi";
import Lab from "./globals/Lab";
import Odoo from "./globals/Odoo";
import TrelloConfig from "./globals/Trello";
import Wishlist from "./globals/Wishlist";
import EventGatekeeperRoute from './routes/EventGatekeeperRoute';
import LabGatekeeperRoute from './routes/LabGatekeeperRoute';
import { webpackIgnore } from "./webpack-ignore";
import Website from './globals/Website';
import Articles from './collections/Articles';

const fallbackModules = ["util"];

const aliasDirectories = [
  "./endpoints/",
  "./server/",
  "./hooks/",
  "./discord/",
  "./ws/",
];

const emptyObjPath = path.resolve(__dirname, "./mocks/EmptyObject.ts");

export default buildConfig({
  admin: {
    bundler: webpackBundler(),
    user: Admins.slug,
    components: {
      beforeDashboard: [XRCBeforeDashboard],
      providers: [XRCStatusProvider, DiscordGuildProvider, MUIThemeProvider],
      graphics: {
        Icon: XRCLogo,
      },
      views: {
        LabTV: {
          Component: LabTV,
          path: '/tv'
        },
        LabGatekeeper: LabGatekeeperRoute,
        EventGatekeeper: EventGatekeeperRoute
      }
    },
    webpack: webpackIgnore(
      emptyObjPath,
      aliasDirectories,
      fallbackModules, 
      (config) => ({
        ...config,
        module: {
            ...config.module,
            rules: [
                ...config.module?.rules ?? [],
                {
                    test: /\.svg%/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'admin[hash][ext][query]'
                    }
                }
            ]
        }
      })
    ),
  },
  db: mongooseAdapter({
    url: process.env.MONGO_URL!
  }),
  editor: lexicalEditor({}),
  routes: {

  },
  collections: [
    Admins,
    Articles,
    Members,
    Devices,
    Heartbeats,
    Attendances,
    Events,
    Descriptions,
    Messages,
    Software,
    Projects,
    Media,
    Schedules,
    Polls,
    Stats,
    Roles,
    Experiences,
    Opportunities,
    Carousels
  ],
  globals: [Lab, Bot, CAS, Wishlist, Odoo, TrelloConfig, GApi, Website],
  typescript: {
    outputFile: path.resolve(__dirname, "./types/PayloadSchema.ts"),
  },
  // graphQL: {
  //     schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  // },
  graphQL: {
    disable: true,
  },
  cors: "*",
});
