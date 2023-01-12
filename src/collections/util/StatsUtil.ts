import payload from "payload";
import { getGuild } from "../../discord/util";
import { CollectionSlugs } from "../../slugs";

export async function createStatSnapshot() {
    // Retrieve Discord member count
    let guild = await getGuild();
    let discordMemberCount = guild.memberCount;

    return await payload.create({
        collection: CollectionSlugs.Stats,
        data: {
            count: {
                discord: discordMemberCount
            }
        }
    })
}