import { postPublicInventoryInDiscord } from "../collections/util/DescriptionsUtil";
import { postLeadershipInDiscord } from "../collections/util/MembersUtil";
import BulkMessageManager from "../discord/BulkMessageManager";
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
        name: "bulk",
        invoke: async () => {
            let channel = await getGuildChannel("lab");
            let bulk = new BulkMessageManager(channel.id);
            await bulk.setMessages(["hello", "there", "world"])
            await Throttle.wait(2000)
            await bulk.setMessages(["goodbye", "there", "world"])
            await Throttle.wait(2000)
            await bulk.deleteAllMessages()   
        }
    }
]

const RoutineMap: Map<string, () => void> = new Map(Routines.map(r => [r.name, r.invoke]))

export default RoutineMap;