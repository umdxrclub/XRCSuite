import payload from "payload";
import { getGuild } from "../../discord/util";

export async function createStatSnapshot() {
    // Retrieve Discord member count
    let guild = await getGuild();
    let discordMemberCount = guild?.memberCount ?? -1;

    return await payload.create({
        collection: "stats",
        data: {
            count: {
                discord: discordMemberCount
            }
        }
    })
}