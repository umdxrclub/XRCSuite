import { XRCSchema } from "@xrc/XRCSchema";
import { WhereOptions } from "sequelize/types";
import { TerpLink, TerpLinkEvent } from "util/terplink";
import { XRCDatabase } from "./DatabaseService";
import { OmitId } from "./models/ModelFactory";

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

    async update(attributes: OmitId<XRCSchema.MemberAttributes>): Promise<boolean>
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
}