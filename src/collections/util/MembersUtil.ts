import payload from "payload";
import { PaginatedDocs } from "payload/dist/mongoose/types";
import { MemberProfile } from "../../data/XRCTypes";
import { CollectionSlugs } from "../../slugs";
import { Media, Member } from "../../types/PayloadSchema";

export async function getAllLeadershipMembers(): Promise<PaginatedDocs<Member>> {
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
export async function getMemberFromDiscordId(id: string): Promise<Member | undefined> {
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

export function createMemberProfile(member: Member): MemberProfile {
    var profilePic: string | undefined = undefined
    switch (typeof(member.profile.picture))
    {
        case "string":
            profilePic = member.profile.picture;

        case "object":
            profilePic = (member.profile.picture as Media).url;
    }

    return {
        name: member.name,
        nickname: member.nickname,
        leadershipRoles: member.leadershipRoles,
        profilePictureUrl: profilePic,
        bio: member.profile.bio,
        links: member.profile.links.map(l => ({ type: l.type, url: l.url }))
    }
}