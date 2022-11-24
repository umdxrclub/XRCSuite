import { XRCSchema } from "@xrc/XRCSchema";
import { TerpLinkEvent } from "../util/terplink";
import Lab from "../globals/Lab";
import { Event, EventManager } from "./EventManager";
import { Member } from "./MemberManager";
import payload from "payload";
import XRC from "./XRC";

/**
 * Manages the state of the XR Club lab. Members can be added and removed from
 * the lab, and the lab can be marked as open/closed.
 */
export class LabManager {

    private _open: boolean = false;
    private _members: Set<Member> = new Set<Member>();
    private _labEvent: Event | undefined
    private _labTerpLinkEvent: TerpLinkEvent | undefined
    private _eventManager: EventManager

    constructor(eventManager: EventManager) {
        this._eventManager = eventManager;
    }

    public async addMember(member: Member) {
        this._members.add(member)
        let event = await this.getLabEvent();
        await event.checkIn(member);
    }

    public async removeMember(member: Member) {
        if (this._members.has(member)) {
            this._members.delete(member);
            let event = await this.getLabEvent();
            await event.checkOut(member);
        }
    }

    public async addOrRemoveMember(member: Member) {
        if (this._members.has(member)) {
            await this.removeMember(member);
            return "checkout"
        } else {
            await this.addMember(member);
            return "checkin"
        }
    }

    public getMembersInLab() {
        return Array.from(this._members.values());
    }

    public isOpen() {
        return this._open;
    }

    public setOpen(open: boolean) {

    }

    public getLabStatus(): XRCSchema.LabStatus
    {
        return  {
            open: this._open,
            availableStaffNames: [],
            schedule: [],
            totalCheckedIn: this._members.size
        }
    }

    private async getLabEvent() {
        if (!this._labEvent) {
            let event = await this._eventManager.getEventByTerpLinkId(XRC.host.labEventId);
            if (!event) {
                throw new Error("Could not find lab event!");
            }

            this._labEvent = event;
        }

        return this._labEvent;
    }

    public async getTerpLinkEvent(): Promise<TerpLinkEvent> {
        if (!this._labTerpLinkEvent) {
            let lab = await payload.findGlobal({
                slug: 'lab'
            })

            let accessCode = lab.event.terplink.accessCode;
            let tlEvent = await XRC.terplink.getEvent(accessCode)
            if (!tlEvent) {
                throw new Error("Could not fetch lab event!")
            }

            this._labTerpLinkEvent = tlEvent;
        }

        return this._labTerpLinkEvent;
    }
}

export interface LabStore {
    open: boolean,
    currentCheckedInMembers: number[],
    schedule: XRCSchema.LabOpening[]
}

export const DEFAULT_LAB_STORE: LabStore = {
    open: false,
    currentCheckedInMembers: [],
    schedule: []
}
