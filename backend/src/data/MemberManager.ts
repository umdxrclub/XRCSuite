import { XRCSchema } from "@xrc/XRCSchema";
import payload from "payload";
import { Where } from "payload/types";
import { WhereOptions } from "sequelize/types";
import { RosterMember, TerpLinkEvent } from "../util/terplink";
import Members from "../collections/Members";
import { XRCDatabase } from "./DatabaseService";
import { OmitId } from "./models/ModelFactory";
import XRC from "./XRC";


export type ResolveMethod = "terplink" | "card"

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
        let tlEvent = await XRC.lab.getTerpLinkEvent();
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


/**
 * Manages the creation and retrieval of members throughout the XR club backend.
 */
export class MemberManager {

    private memberCache: Map<number, Member>;

    constructor()
    {
        this.memberCache = new Map();
    }

    public async createMember(attributes: OmitId<XRCSchema.MemberAttributes>): Promise<Member>
    {
        let dbMember = await XRCDatabase.models.members.create(attributes)
        let data = dbMember.getData()
        let member = new Member(data);
        this.memberCache.set(data.id, member)

        return member;
    }

    public async getMember(attributes: WhereOptions<Required<XRCSchema.MemberAttributes>>): Promise<Member | undefined>
    {
        let dbMember = await XRCDatabase.models.members.findOne({ where: attributes })
        var member: Member | undefined = undefined;
        if (dbMember) {
            let data = dbMember.getData();
            if (!this.memberCache.has(data.id)) {
                member = new Member(data)
                this.memberCache.set(data.id, member)
            } else {
                member = this.memberCache.get(data.id)
            }
        }

        return member
    }

    public async getAllMembers(): Promise<Member[]> {
        let dbMembers = await XRCDatabase.models.members.findAll();
        let members: Member[] = []
        dbMembers.forEach(m => {
            let data = m.getData()
            if (this.memberCache.has(data.id)) {
                members.push(this.memberCache.get(data.id)!)
            } else {
                let member = new Member(data);
                this.memberCache.set(data.id, member);
                members.push(member);
            }
        })

        return members;
    }

    public async resolveMemberByEventPass(issuanceId: string): Promise<Member | undefined> {
        var member: Member | undefined = await XRC.members.getMember({ terplinkIssuanceId: issuanceId });

        // If they're not there, let's try to find them in our roster page. 
        if (!member) {
        //     let tlEvent = await XRC.lab.getTerpLinkEvent();
        //     let tlCheckInMember = await tlEvent.getMemberFromIssuanceId(issuanceId);
            
        //     // Ensure that the TerpLink member was actually found.
        //     if (!tlCheckInMember) {
        //         return undefined;
        //     }

        //     // Check if they have an account id in the database.
        //     member = await XRC.members.getMember({ terplinkAccountId: tlCheckInMember.getMemberId() })
        //     if (!member) {
        //         // Check if they are a roster member.
        //         let name = tlCheckInMember.getName();
        //         let roster = await XRC.terplink.getRosterMembers(name);
        //         var foundEmail: string | undefined = undefined;
        //         for (var i = 0; i < roster.length && !foundEmail; i++) {
        //             let rm = roster[i];
        //             let rmEmail = await rm.fetchEmail();
        //             let tlMembers = await tlEvent.lookupMembers(rmEmail);
        //             if (tlMembers.length == 1) {
        //                 let rmAsTerpLinkMember = tlMembers[0];
        //                 // Check if same member.
        //                 if (rmAsTerpLinkMember.getMemberId() == tlCheckInMember.getMemberId()) {
        //                     foundEmail = rmEmail;
        //                 }
        //             }
        //         }

        //         if (!foundEmail) {
        //             return {
        //                 success: false,
        //                 error: "Not TerpLink Member",
        //                 data: null
        //             }
        //         } else {
        //             // They are a member, but if they were previously not in the DB,
        //             // they could not have received the contract yet.
        //             member = await XRC.members.createMember({
        //                 terplinkAccountId: tlCheckInMember.getMemberId(),
        //                 terplinkIssuanceId: issuanceId,
        //                 email: foundEmail,
        //                 name: name,
        //                 signedContract: false,
        //                 wasSentContract: true
        //             });

        //             // Send contract
        //             await XRC.odoo.sendSignatureRequest(XRC.host.labOdooContractId, 
        //                 foundEmail, 
        //                 "XR Lab Agreement", 
        //                 "LabAgreement.pdf")

        //             return {
        //                 success: false,
        //                 error: "Need to sign contract",
        //                 data: null
        //             }
        //         }
        //     }
        // } else {
        //     // They are a member, but check if they have signed the contract
        //     if (!member.getAttributes().signedContract) {
        //         let signers = await XRC.odoo.getSignersOfContract(XRC.host.labOdooContractId);
        //         let memberEmailName = member!.getAttributes().email?.split("@")[0]
        //         let didSign = signers.some(os => os.partner_name.split("@")[0] == memberEmailName)

        //         if (!didSign) {
        //             if (!member.getAttributes().wasSentContract) {
        //                 // If they weren't sent the contract yet, do that now.
                        
        //             }
                    
        //             return {
        //                 success: false,
        //                 error: "Need to sign contract",
        //                 data: null
        //             }
        //         }
        //     }
        }

        return member;
    } 
}

export class Member {
    private _attributes: XRCSchema.MemberAttributes;

    constructor(attributes: XRCSchema.MemberAttributes)
    {
        this._attributes = attributes;
    }

    getAttributes()
    {
        return Object.assign({}, this._attributes)
    }

    async update(attributes: Partial<OmitId<XRCSchema.MemberAttributes>>): Promise<boolean>
    {
        let success = (await XRCDatabase.models.members.update(attributes, { where: { id: this._attributes.id }}))[0] > 0
        if (success) {
            this._attributes = {...this._attributes, ...attributes};
        }

        return success;
    }

    async checkInOnTerpLink(event: TerpLinkEvent): Promise<boolean> {
        if (this._attributes.terplinkAccountId) {
            await event.checkIn(this._attributes.terplinkAccountId);
            return true;
        }

        return false;
    }

    async checkOutOnTerplink(event: TerpLinkEvent): Promise<boolean> {
        if (this._attributes.terplinkAccountId) {
            await event.checkOut(this._attributes.terplinkAccountId);
            return true;
        }

        return false;
    }

    async sendLabAgreement(allowRepeatSend?: boolean): Promise<boolean> {
        var wasSent = false;

        if (this._attributes.email && (allowRepeatSend || !this._attributes.wasSentContract)) {
            // Send contract
            await XRC.odoo.sendSignatureRequest(XRC.host.labOdooContractId, 
                this._attributes.email, 
                "XR Lab Agreement", 
                "LabAgreement.pdf")

            // Update DB to signify that we send the contract
            await this.update({ wasSentContract: true })

            wasSent = true;
        }
        
        return wasSent;
    }
}