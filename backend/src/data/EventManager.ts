import { XRCSchema } from "@xrc/XRCSchema";
import { TerpLink } from "../util/terplink";
import { Member } from "./MemberManager";
import { AttendanceModel } from "./models/AttendanceModel";
import { EventModel } from "./models/EventModel";
import { OmitId } from "./models/ModelFactory";
import XRC from "./XRC";

export class EventManager {

    private _eventCache: Map<number, Event>
    private _terplink: TerpLink

    constructor(terplink: TerpLink) {
        this._eventCache = new Map()
        this._terplink = terplink;
    }

    async createEvent(attributes: OmitId<XRCSchema.Event>) {
        let createdEvent = await EventModel.create(attributes);
        let data = createdEvent.getData()
        let event = new Event(data);

        this._eventCache.set(data.id, event)
        return event;
    }

    private async getOrAddCachedEvent(event: EventModel): Promise<Event> {
        let data = event.getData()
        if (this._eventCache.has(data.id)) {
            return this._eventCache.get(data.id)!;
        } else {
            let newEvent = new Event(data);
            this._eventCache.set(data.id, newEvent);
            return newEvent;
        }
    }

    async getEventByTerpLinkId(terplinkId: number) {
        let event = await EventModel.findOne({where: {
            terplinkEventId: terplinkId
        }})

        return event ? this.getOrAddCachedEvent(event) : undefined;
    }

    /**
     * Gets an event by a TerpLink access code.
     *
     * @param accessCode The access code of the event to search for
     */
    async getEventByAccessCode(accessCode: string): Promise<Event | undefined> {
        let dbEvent = await EventModel.findOne({where: {
            terplinkEventCode: accessCode
        }})

        if (dbEvent)  {
            let event = this.getOrAddCachedEvent(dbEvent);
            return event;
        } else {
            // Try to find the event on TerpLink itself.
            let tlEvent = await XRC.terplink.getEvent(accessCode);
            if (tlEvent) {
                // We found an event, now add it to the database.
                let event = await this.createEvent({
                    name: tlEvent.getEventName(),
                    terplinkEventCode: accessCode,
                    terplinkEventId: tlEvent.getEventId(),
                    startDate: tlEvent.getStartDate().toISOString(),
                    endDate: tlEvent.getEndDate().toISOString()
                })

                return event;
            }
        }

        return undefined;
    }

    async createEvents(attributes: OmitId<XRCSchema.Event>[]) {
        let createdEvents = await EventModel.bulkCreate(attributes)
        let eventData = createdEvents.map(e => e.getData())
        let events = eventData.map(d => new Event(d))
        events.forEach(e => this._eventCache.set(e.getAttributes().id, e))

        return events;
    }

    async deleteEvent(event: Event) {
        throw new Error("Method not implemented")
    }

    async addAllTerpLinkEvents(organizationId: number): Promise<Event[] | undefined> {
        let terplinkEvents = await this._terplink.getEvents(279233)
        if (terplinkEvents) {
            let newEvents = terplinkEvents.filter(e => !this._eventCache.has(e.id))

            // Fetch access codes.
            let accessCodes = await Promise.all(newEvents.map(async e => {
                let code = await this._terplink.getAccessCode(e.id)
                console.log(`Got ${code} for event ${e.name}`)
                return code;
            }))

            await this.createEvents(newEvents.map((e,i) => {
                return {
                    name: e.name,
                    terplinkEventId: e.id,
                    startDate: e.startsOn,
                    endDate: e.endsOn,
                    terplinkEventCode: accessCodes[i]
                }
            }))
        }

        return undefined
    }
}

export class Event {
    private _attributes: XRCSchema.Event;

    constructor(attributes: XRCSchema.Event) {
        this._attributes = attributes;
    }

    getAttributes() {
        return Object.assign({}, this._attributes)
    }

    async getAttendees() {

    }

    async isCheckedIn(member: Member) {
        let latestCheckIn = await AttendanceModel.findOne({
            where: {
                memberId: member.getAttributes().id,
                id: this.getAttributes().id
            }
        })

        return latestCheckIn?.getData().type == 0 ?? false
    }

    async checkInOrOut(member: Member): Promise<"in" | "out" | undefined> {
        let checkedIn = await this.isCheckedIn(member);

        var result: "in" | "out" | undefined = undefined;
        if (checkedIn) {
            result = await this.checkOut(member) ? "out" : undefined;
        } else {
            result = await this.checkIn(member) ? "in" : undefined;
        }

        return result;
    }

    async checkIn(member: Member): Promise<boolean> {
        let checkedIn = await this.isCheckedIn(member);
        if (!checkedIn) {
            await AttendanceModel.create({
                eventId: this._attributes.id,
                memberId: member.getAttributes().id,
                date: new Date(),
                type: 0
            })

            // If this event has an associated TerpLink access code, use it to 
            // check the member in.
            if (this._attributes.terplinkEventCode) {
                let tlEvent = await XRC.terplink.getEvent(this._attributes.terplinkEventCode);

                if (tlEvent) {
                    await member.checkInOnTerpLink(tlEvent);
                }
            }
        }

        return !checkedIn;
    }

    async checkOut(member: Member): Promise<boolean> {
        let checkedIn = await this.isCheckedIn(member);
        if (checkedIn) {
            await AttendanceModel.create({
                eventId: this._attributes.id,
                memberId: member.getAttributes().id,
                date: new Date(),
                type: 1
            })
        }

        return checkedIn;
    }
}