import { Member } from '../../../data/MemberManager';
import XRC from '../../../data/XRC';
import { APIRoute } from '../api';

const lab: APIRoute = {
    path: "lab",
    handlers: {
        "get": async (req, res) => {
            return {
                success: true,
                data: XRC.lab.getLabStatus()
            }
        }
    }
}

const lab_checkin: APIRoute = {
    "path": "lab/checkin",
    handlers: {
        "post": async (req, res) => {
            
            // Check if TerpLink issuance ID was provided 
            if (req.query.tlIssuanceId) {
                let issuanceId = req.query.tlIssuanceId as string;

                // Try to fetch the member by their issuance ID from our DB.
                var member: Member | undefined = await XRC.members.getMember({ terplinkIssuanceId: issuanceId });
                
                // If they're not there, let's try to find them in our roster page. 
                if (!member) {
                    let tlEvent = await XRC.lab.getTerpLinkEvent();
                    let tlCheckInMember = await tlEvent.getMemberFromIssuanceId(issuanceId);
                
                    // Ensure that the TerpLink member was actually found.
                    if (!tlCheckInMember) {
                        throw new Error("Could not get TerpLink member from the lab event using their issuance id!");
                    }

                    // Check if they have an account id in the database.
                    member = await XRC.members.getMember({ terplinkAccountId: tlCheckInMember.getMemberId() })
                    if (!member) {
                        // Check if they are a roster member.
                        let name = tlCheckInMember.getRosterName();
                        let roster = await XRC.terplink.getRosterMembers(name);
                        var foundEmail: string | undefined = undefined;
                        for (var i = 0; i < roster.length && !foundEmail; i++) {
                            let rm = roster[i];
                            let rmEmail = await rm.fetchEmail();
                            let tlMembers = await tlEvent.lookupMembers(rmEmail);
                            if (tlMembers.length == 1) {
                                let rmAsTerpLinkMember = tlMembers[0];
                                // Check if same member.
                                if (rmAsTerpLinkMember.getMemberId() == tlCheckInMember.getMemberId()) {
                                    foundEmail = rmEmail;
                                }
                            }
                        }

                        if (!foundEmail) {
                            return {
                                success: false,
                                error: "You are not an XR Club member on TerpLink",
                                data: null
                            }
                        } else {
                            // They are a member, but if they were previously not in the DB,
                            // they could not have received the contract yet.
                            member = await XRC.members.createMember({
                                terplinkAccountId: tlCheckInMember.getMemberId(),
                                terplinkIssuanceId: issuanceId,
                                email: foundEmail,
                                name: name,
                                signedContract: false,
                                wasSentContract: false
                            });
                        }
                    }
                }
            }

            if (member) {
                let validateAgreement = (req.query.validateAgreement != "0") ?? true

                // Check if they have signed the contract
                if (validateAgreement && !member.getAttributes().signedContract) {
                    let signers = await XRC.odoo.getSignersOfContract(XRC.host.labOdooContractId);
                    let memberEmailName = member!.getAttributes().email?.split("@")[0]
                    let didSign = signers.some(os => os.partner_name.split("@")[0] == memberEmailName)

                    if (!didSign) {
                        // Try to send the contract
                        await member.sendLabAgreement();
                        
                        return {
                            success: false,
                            error: "You need to sign the XR Lab agreement",
                            data: null
                        }
                    } else {
                        // Update member
                        await member.update({ signedContract: true })
                    }
                }

                let type = await XRC.lab.addOrRemoveMember(member);

                return {
                    success: true,
                    data: {
                        name: member.getAttributes().name,
                        type: type
                    }
                }
            }

            return {
                success: false,
                error: "Unknown error",
                data: null
            }
        }
    }
}

export const LabRoutes: APIRoute[] = [lab, lab_checkin]