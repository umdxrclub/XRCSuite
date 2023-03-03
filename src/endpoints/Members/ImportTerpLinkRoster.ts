import { Endpoint } from "payload/dist/config/types";
import Members from "../../collections/Members";
import { Member } from "../../types/PayloadSchema";
import XRC from "../../server/XRC";
import { makeAdminHandler } from "../RejectIfNoUser";

/**
 * This endpoint fetches the current roster and adds any unknown email as a
 * member.
 */
const ImportRosterEndpoint: Endpoint = {
    path: "/roster",
    method: "post",
    handler: makeAdminHandler(async (req, res) => {
        let roster = await XRC.terplink.getRosterMembers();

        let promises = roster.map(async rosterMember => {
            console.log("Retrieved: " + rosterMember.name)

            // See if an existing member already exists.
            let existingMemberSearch = await req.payload.find({
                collection: "members",
                where: {
                    'umd.terplink.communityId': {
                        equals: rosterMember.communityId
                    }
                }
            })

            if (existingMemberSearch.totalDocs == 0) {
                // Fetch the member's email
                let email = await rosterMember.fetchEmail();
                console.log("Retrieved email " + email + " for " + rosterMember.name);

                // Create the new member
                await req.payload.create({
                    collection: "members",
                    data: {
                        name: rosterMember.name,
                        email: email,
                        isClubMember: true,
                        umd: {
                            terplink: {
                                communityId: rosterMember.communityId
                            }
                        }
                    } as any
                })
            }
        });

        // Wait for all the member creations.
        await Promise.all(promises)

        // Send successful response.
        res.status(200).send()
    })
}

export default ImportRosterEndpoint;