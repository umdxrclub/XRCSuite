import payload from "payload";
import { PaginatedDocs } from "payload/dist/mongoose/types";
import { MemberProfile } from "../../types/XRCTypes";
import { CollectionSlugs } from "../../slugs";
import { Media, Member } from "../../types/PayloadSchema";
import { Where } from "payload/types";
import XRC from "../../util/XRC";
import { getLabTerpLinkEvent } from "../../util/lab";
import { RosterMember } from "../../util/terplink";
import Members from "../Members";

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

export async function isDiscordMemberLeadership(id: string): Promise<boolean> {
    let member = await getMemberFromDiscordId(id);

    if (member) {
        let roles = member.leadershipRoles ?? []
        return roles.length > 0
    }

    return false;
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


export type ResolveMethod = "id" | "terplink" | "card"

export async function resolveMember(method: ResolveMethod, value: string): Promise<Member | undefined> {
    var key: string = ""

    // Construct a where query to see if this member is already within the
    // database.
    if (method == "card") {
        key = "umd.cardSerial"
    } else if (method == "terplink") {
        key = "umd.terplink.issuanceId"
    }

    let where: Where = {
        [key]: {
            equals: value
        }
    }

    // Search for the member.
    let search = await payload.find<Member>({
        collection: Members.slug,
        where: where
    })

    if (search.totalDocs == 1) {
        // A member was found in our database!
        return search.docs[0];
    } else if (search.totalDocs == 0) {
        // No member was found within our database, see if we can find them on
        // TerpLink.

        if (method != "terplink") {
            // If we don't have a TerpLink issuance id, then there's nothing
            // more we can do to resolve this user, so return undefined.
            return undefined;
        }

        // Fetch the member on TerpLink by their issuance id using the XR Lab
        // event.
        let tlEvent = await getLabTerpLinkEvent();
        let tlMember = await tlEvent.getMemberFromIssuanceId(value);

        // If we couldn't find a TerpLink member by their issuance id, then
        // something sus happened and we cannot resolve them.
        if (!tlMember) {
            return undefined;
        }

        // Now try to search for them in the roster and match them by their
        // email.
        let rosterName = tlMember.getRosterName();
        let roster = await XRC.terplink.getRosterMembers(rosterName);
        var foundRosterMember: RosterMember | undefined = undefined
        var foundEmail: string | undefined = undefined;

        for (var i = 0; i < roster.length && !foundRosterMember; i++) {
            let rosterMember = roster[i];
            let rosterMemberEmail = await rosterMember.fetchEmail();
            let tlMembers = await tlEvent.lookupMembers(rosterMemberEmail);
            if (tlMembers.length == 1) {
                let rosterTerpLinkMember = tlMembers[0];

                // Check if same member by comparing their member IDs.
                if (rosterTerpLinkMember.getMemberId() == tlMember.getMemberId()) {
                    foundRosterMember = rosterMember;
                    foundEmail = rosterMemberEmail
                }
            }
        }

        var existingId: string | undefined = undefined
        var partialMember: Partial<Member> = {
            name: tlMember.getName(),
            isClubMember: !!foundRosterMember,
            umd: {
                terplink: {
                    accountId: tlMember.getMemberId(),
                    issuanceId: value,
                    communityId: foundRosterMember.communityId
                }
            }
        }

        if (foundRosterMember) {
            // Add their email
            partialMember['email'] = foundEmail;

            // See if this roster member was already in the database, since they
            // could have been added when we did a roster import.
            let search = await payload.find({
                collection: Members.slug,
                where: {
                    'umd.terplink.communityId': {
                        equals: foundRosterMember.communityId
                    }
                }
            })

            if (search.totalDocs == 1) {
                let foundMember = search.docs[0]
                existingId = foundMember.id
            }
        }

        var member: Member;
        if (existingId) {
            member = await payload.update({
                collection: Members.slug,
                id: existingId,
                data: partialMember
            })
        } else {
            member = await payload.create({
                collection: Members.slug,
                data: partialMember
            })
        }

        return member;
    }
}