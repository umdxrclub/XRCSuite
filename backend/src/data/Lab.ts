import { XRCSchema } from "@xrc/XRCSchema";
import { Member } from "./MemberManager";
import { Event, EventManager } from "./EventManager";
import XRC from "./XRC";

/**
 * Manages the state of the XR Club lab. Members can be added and removed from
 * the lab, and the lab can be marked as open/closed.
 */
export class LabManager {

    private _open: boolean = false;
    private _members: Member[] = []
    private _labEvent: Event | undefined
    private _eventManager: EventManager

    constructor(eventManager: EventManager) {
        this._eventManager = eventManager;
    }

    public async addMember(member: Member)
    {
        this._members.push(member)
        let event = await this.getLabEvent();
        event.checkIn(member);
    }

    public async removeMember(member: Member)
    {
        let index = this._members.indexOf(member);
        if (index > -1) {
            this._members = this._members.splice(index, 1)
            let event = await this.getLabEvent();
            event.checkOut(member);
        }
    }

    public getMembersInLab() {
        return [...this._members];
    }

    public isOpen()
    {
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
            totalCheckedIn: this._members.length
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
