import { TextChannel } from "discord.js";
import { postPublicInventoryInDiscord } from "../collections/util/DescriptionsUtil";
import { postLeadershipInDiscord } from "../collections/util/MembersUtil";
import { createRoleSelectMessage } from "../collections/util/RolesUtil";
import MultiMessageManager from "../discord/multi/MultiMessageManager";
import { createAttachmentFromImageData, getGuildChannel, sendGuildMessage } from "../discord/util";
import { Throttle } from "./throttle";

const Routines: { name: string, invoke: () => void }[] = [
    {
        name: "leadership",
        invoke: postLeadershipInDiscord
    },
    {
        name: "inventory",
        invoke: postPublicInventoryInDiscord
    },
    {
        name: "roles",
        invoke: async () => {
            
        }
    }
]

const RoutineMap: Map<string, () => void> = new Map(Routines.map(r => [r.name, r.invoke]))

export default RoutineMap;