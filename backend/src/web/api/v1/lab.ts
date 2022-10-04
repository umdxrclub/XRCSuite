import { Member } from 'data/MemberManager';
import { Odoo } from 'util/odoo';
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

                    // Check if they are a roster member.
                    let name = tlCheckInMember.getName();
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
                            error: "Not TerpLink Member"
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
                            wasSentContract: true
                        });

                        // Send contract
                        await XRC.odoo.sendSignatureRequest(XRC.host.labOdooContractId, 
                            foundEmail, 
                            "XR Lab Agreement", 
                            "LabAgreement.pdf")

                        return {
                            success: false,
                            error: "Need to sign contract"
                        }
                    }
                } else {
                    // They are a member, but check if they have signed the contract
                    if (!member.getAttributes().signedContract) {
                        let signers = await XRC.odoo.getSignersOfContract(XRC.host.labOdooContractId);
                        let didSign = signers.some(os => os.partner_name == member!.getAttributes().email)
                        
                        if (didSign) {
                            return {
                                success: true,
                                data: "check in!"
                            }
                        }
                    }
                }
            }


            return {
                success: true,
                data: null
            }
        }
    }
}

export const LabRoutes: APIRoute[] = [lab, lab_checkin]