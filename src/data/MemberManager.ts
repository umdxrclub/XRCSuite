import payload from "payload";
import { Where } from "payload/types";
import Members from "../collections/Members";
import { getLabTerpLinkEvent } from "../util/lab";
import { RosterMember } from "../util/terplink";
import XRC from "./XRC";

export type ResolveMethod = "id" | "terplink" | "card"

export async function resolveMember(method: ResolveMethod, value: string) {
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
    let search = await payload.find({
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
            // more we can do to resolve this user, so return null.
            return null;
        }

        // Fetch the member on TerpLink by their issuance id using the XR Lab
        // event.
        let tlEvent = await getLabTerpLinkEvent();
        let tlMember = await tlEvent.getMemberFromIssuanceId(value);

        // If we couldn't find a TerpLink member by their issuance id, then
        // something sus happened and we cannot resolve them.
        if (!tlMember) {
            return null;
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
        var member: any = {
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
            member['email'] = foundEmail;

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

        var member: any
        if (existingId) {
            member = await payload.update({
                collection: Members.slug,
                id: existingId,
                data: member
            })
        } else {
            member = await payload.create({
                collection: Members.slug,
                data: member
            })
        }

        return member;
    }
}