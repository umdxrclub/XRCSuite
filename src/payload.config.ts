import path from "path";
import { buildConfig } from "payload/config";
import Devices from "./collections/Devices";
import Members from "./collections/Members";
import Admins from "./collections/Admins";
import Events from "./collections/Events";
import Attendances from "./collections/Attendances";
import Heartbeats from "./collections/Heartbeats";
import Lab from "./globals/Lab";
import Bot from "./globals/Discord";
import Wishlist from "./globals/Wishlist";
import CAS from "./globals/CAS";
import XRCLogo from "./components/XRCLogo";
import Descriptions from "./collections/Descriptions";
import Messages from "./collections/Messages";
import Software from "./collections/Software";
import Projects from "./collections/Projects";
import Media from "./collections/Media";
import Schedules from "./collections/Schedules";
import Polls from "./collections/Polls";
import LabGatekeeperRoute from "./routes/LabGatekeeperRoute";
import XRCBeforeDashboard from "./components/dashboard/XRCBeforeDashboard";
import Stats from "./collections/Stats";
import Odoo from "./globals/Odoo";
import Roles from "./collections/Roles";
import Integrations from "./collections/Integrations";
import DiscordGuildProvider from "./components/providers/DiscordGuildProvider";
import EventGatekeeperRoute from "./routes/EventGatekeeperRoute";
import { MUIThemeProvider } from "./components/providers/MUIThemeProvider";
import TrelloConfig from "./globals/Trello";
import { Experiences } from "./collections/Experiences";
import { Opportunities } from "./collections/Opportunities";
import { webpackIgnore } from "./webpack-ignore";

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
    user: Admins.slug,
    components: {
      beforeDashboard: [XRCBeforeDashboard],
      providers: [DiscordGuildProvider, MUIThemeProvider],
      graphics: {
        Icon: XRCLogo,
      },
      routes: [LabGatekeeperRoute, EventGatekeeperRoute],
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
  collections: [
    Admins,
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
    Integrations,
    Experiences,
    Opportunities,
  ],
  globals: [Lab, Bot, CAS, Wishlist, Odoo, TrelloConfig],
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
