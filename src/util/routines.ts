import { postPublicInventoryInDiscord } from "../collections/util/DescriptionsUtil";
import { postLeadershipInDiscord } from "../collections/util/MembersUtil";
import { createAttachmentFromImageData, sendGuildMessage } from "../discord/util";

const Routines: { name: string, invoke: () => void }[] = [
    {
        name: "leadership",
        invoke: postLeadershipInDiscord
    },
    {
        name: "inventory",
        invoke: postPublicInventoryInDiscord
    }
]

const RoutineMap: Map<string, () => void> = new Map(Routines.map(r => [r.name, r.invoke]))

export default RoutineMap;