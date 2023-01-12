import payload from "payload";
import { PaginatedDocs } from "payload/dist/mongoose/types";
import { MemberProfile } from "../../data/XRCTypes";
import { CollectionSlugs } from "../../slugs";

export async function getAllLeadershipMembers(): Promise<PaginatedDocs<any>> {
    let leadershipMembers = await payload.find({
        collection: CollectionSlugs.Members,
        where: {
            and: [
                {
                    leadershipRoles: {
                        not_equals: undefined
                    }
                },
                {
                    leadershipRoles: {
                        not_equals: []
                    }
                }
            ]
        }
    })

    return leadershipMembers;
}

/**
 * Gets a Member from their Discord id.
 *
 * @param id The id of the Discord member
 * @returns Whether the member is registered within the club database.
 */
export async function getMemberFromDiscordId(id: string): Promise<any | undefined> {
    let docs = await payload.find({
        collection: CollectionSlugs.Members,
        where: {
            'integrations.discord': {
                equals: id
            }
        }
    })

    return docs.totalDocs == 1 ? docs.docs[0] : undefined;
}

export function createMemberProfile(member: any): MemberProfile {
    return {
        name: member.name,
        nickname: member.nickname,
        leadershipRoles: member.leadershipRoles,
        profilePictureUrl: member.profile.picture?.url,
        bio: member.profile.bio,
        links: member.profile.links.map(l => ({ type: l.type, url: l.url }))
    }
}