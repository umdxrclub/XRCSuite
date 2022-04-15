import { AxiosResponse } from "axios";
import { parse } from "node-html-parser";
import querystring from "querystring";
import { queryStringFromForm, X_WWW_FORM_HEADERS_CONFIG } from "./scrape-util";
import { useAxios } from "./shared-axios";
import { TerpLinkSchema } from "xrc-schema";

/**
 * TerpLink is a UMD service used by clubs to manage events and rosters. This
 * interface provides the methods that should be implemented by some TerpLink
 * provider. A TerpLink provider may include a controller that runs an emulator
 * that manages the Check-in app, or something that makes the API calls directly.
*/
export interface TerpLink {
    /**
     * Attempts to get a TerpLinkEvent based on its event code.
     *
     * @param eventCode The event code to search for
     */
    getEvent(eventCode: string): Promise<TerpLinkEvent | null>
}

/**
 * A TerpLink event is some club event that has some start/end time and a roster.
 * Members are checked in/out of the event as it progresses.
 */
export interface TerpLinkEvent {
    /**
     * Returns the name of the event.
     */
    getEventName(): string,

    /**
     * Gets the start time of the event.
     */
    getStartDate(): Date,

    /**
     * Gets the end time of the event.
     */
    getEndDate(): Date,

    /**
     * Gets the image URL associated with the event.
     */
    getImageURL(): string,

    /**
     * Checks in a member with a given member id.
     *
     * @param memberId The member id to check in
     */
    checkIn(memberId: string): Promise<void>

    /**
     * Checks out a member with a given member id.
     *
     * @param memberId The member id to check in
     */
    checkOut(memberId: string): Promise<void>

    /**
     * Checks in a member with a given member id.
     *
     * @param attendanceId The attendance id to remove
     */
    remove(attendanceId: number): Promise<void>

    /**
     * Searches up members by a given query.
     *
     * @param query Names to search for
     */
    lookupMembers(query: string): Promise<TerpLinkEventMember[]>

    /**
     * Gets a member based on their issuance id, which is typically found on
     * the TerpLink event pass.
     *
     * @param issuanceId The issuanceId to search for.
     */
    getMemberFromIssuanceId(issuanceId: string): Promise<TerpLinkEventMember>

    /**
     * Gets all attendees of the event.
     *
     * @param withLogAction If provided, filters the attendees based on whether
     * they are checked in/out.
     * @param includeRemoved If provided, whether to include attendees that have
     * been removed.
     */
    getEventAttendees(withLogAction?: TerpLinkSchema.AttendeeLastLogAction[], includeRemoved?: boolean): Promise<TerpLinkEventMember[]>
}

/**
 * A member is someone who is eligible to participate in a TerpLink event.
 * Members can be checked in/out and removed.
 */
export interface TerpLinkEventMember {
    /**
     * Get's the member's account
     */
    getAccount(): TerpLinkSchema.Account

    /**
     * Gets the name of the member.
     */
    getName(): string,

    /**
     * Gets the member ID of the member.
     */
    getMemberId(): string

    /**
     * Checks the member in.
     */
    checkIn(): Promise<void>

    /**
     * Checks the member out.
     */
    checkOut(): Promise<void>

    /**
     * Removes the member from the event.
     */
    remove(): Promise<void>

}

const CAMPUS_LABS_API_URL = "https://se-app-checkins.campuslabs.com/v4.0/";
const SUCCESSFUL_AUTH_URL = "https://terplink.umd.edu/account/tokens?isMobile=true";

function log(msg: string) {
    console.log(`[TerpLink] ${msg}`)
}

class TerpLinkProvider implements TerpLink {

    private events: Map<string, TerpLinkEvent> = new Map();

    private async getBearer(authUrl: string): Promise<string> {
        const axios = useAxios();
        // Attempt authentication with CAS. It is assumed that CAS cookie
        // is already obtained via the CAS init startup service. This will
        // either bring us to a page where we forward CAS auth with campus
        // labs or the authenticated campus labs.
        var bearerRes = await axios.get(authUrl);

        // Check if already authenticated
        if ((bearerRes.request.res.responseUrl as string) != SUCCESSFUL_AUTH_URL) {
            // We are at a redirect page, so scrape and forward the
            // necessary information.
            const authRoot = parse(bearerRes.data);
            const postUrl = authRoot.querySelector("form")!.attributes.action
            const form = queryStringFromForm(authRoot.querySelector("form")!)

            const forwardRes = await axios.post(postUrl, form, X_WWW_FORM_HEADERS_CONFIG)
            const campusForwardRoot = parse(forwardRes.data);
            const campusPostURL = campusForwardRoot.querySelector("form")!.attributes.action
            const campusForm = queryStringFromForm(campusForwardRoot.querySelector("form")!)
            log("(1/3) Got CampusLabs response")

            const connectRes = await axios.post(campusPostURL, campusForm, X_WWW_FORM_HEADERS_CONFIG)
            const connectRoot = parse(connectRes.data);
            const connectQuery = queryStringFromForm(connectRoot.querySelector("form")!)
            const connectPostUrl = connectRoot.querySelector("form")!.attributes.action
            log("(2/3) Got connect response")

            const oidcRes = await axios.post(connectPostUrl, connectQuery, X_WWW_FORM_HEADERS_CONFIG)
            log("(3/3) Got Bearer!")
            bearerRes = oidcRes;
        } else {
            log("Already authenticated with CampusLabs!")
        }

        return bearerRes.data.split("'")[1]
    }

    async getEvent(eventCode: string): Promise<TerpLinkEvent | null> {
        // Check and see if the event has already been cached.
        var cachedEvent = this.events.get(eventCode);
        if (cachedEvent) {
            return cachedEvent;
        }

        const axios = useAxios();

        // First get the event data from TerpLink using the access code.
        try {
            var eventRes = await axios.get(CAMPUS_LABS_API_URL + "event", {
                params: {
                    accesscode: eventCode
                }
            })
        } catch {
            // If there was a 400 err, return null.
            return null;
        }

        let eventData = eventRes.data as TerpLinkSchema.Event;

        const event = new TerpLinkEventProvider(eventData);
        this.events.set(eventCode, event);
        return event;
    }
}

class TerpLinkEventProvider implements TerpLinkEvent {
    private event: TerpLinkSchema.Event;
    private bearer: string = "";

    constructor(event: TerpLinkSchema.Event) {
        this.event = event;
    }

    getEventName(): string {
        return this.event.name;
    }
    getStartDate(): Date {
        return new Date(this.event.startsOn);
    }
    getEndDate(): Date {
        return new Date(this.event.endsOn);
    }
    getImageURL(): string {
        return this.event.imagePath;
    }
    async checkIn(memberId: string): Promise<void> {
        await this.post("attendance/checkin", {
            accountId: memberId,
            email: null
        })
    }
    async checkOut(memberId: string): Promise<void> {
        await this.post("attendance/checkout", {
            accountId: memberId,
            email: null
        })
    }
    async remove(attendeeId: number): Promise<void> {
        await this.delete(`attendance/${attendeeId}`);
    }

    async lookupMembers(query: string): Promise<TerpLinkEventMember[]> {
        const queryForm = querystring.stringify({
            query: query,
            take: 50,
            skip: 0
        })

        const res = await this.get(`member?${queryForm}`);
        const members = res.data.items as TerpLinkSchema.Member[]
        return members.map(member => new TerpLinkEventMemberProvider(member.attendanceId, member.account, this));
    }

    async getMemberFromIssuanceId(issuanceId: string): Promise<TerpLinkEventMember> {
        const res = await this.get(`member?issuanceId=${issuanceId}&skip=0&take=10`)
        if ((res.data.items as any[]).length > 0) {
            const member = res.data.items[0] as TerpLinkSchema.Member;
            return new TerpLinkEventMemberProvider(member.attendanceId, member.account, this);
        }

        throw new Error("No member found!");
    }

    async getEventAttendees(withLogAction?: TerpLinkSchema.AttendeeLastLogAction[], includeRemoved?: boolean): Promise<TerpLinkEventMember[]> {
        const res = await this.get("attendance?skip=0&take=100")
        var attendees = res.data.items as TerpLinkSchema.Attendee[]

        // By default, this will only return checked-in attendees.
        var filter: TerpLinkSchema.AttendeeLastLogAction[] = []
        if (withLogAction)
            filter = withLogAction
        else
            filter = [ "CheckIn" ]

        // Filter attendees.
        attendees = attendees.filter(attendee => filter.includes(attendee.lastLogAction)
            && (includeRemoved || attendee.status === "Attended"))

        return attendees.map(attendee => new TerpLinkEventMemberProvider(attendee.id, attendee.account, this));
    }

    private async request(method: "get" | "post" | "delete", path: string, data?: any, needBearer?: boolean): Promise<AxiosResponse> {
        const axios = useAxios();

        // Get the bearer token if it is requested or it is currently an empty string
        if (needBearer || this.bearer == "") {
            await this.getBearer();
        }

        // Make the request
        try {
            var res = await axios.request({
                url: CAMPUS_LABS_API_URL + `event/${this.event.accessToken}/${path}`,
                method: method,
                data: data,
                headers: {
                    Authorization: `Bearer ${this.bearer}`
                }
            })
        } catch {
            // Try to get a fresh bearer and attempt the request again
            if (!needBearer) {
                res = await this.request(method, path, data, true)
            } else {
                throw new Error("Could not fetch new bearer!")
            }
        }

        return res
    }

    private async get(path: string): Promise<AxiosResponse> {
        return await this.request("get", path)
    }

    private async post(path: string, data: any): Promise<AxiosResponse> {
        return await this.request("post", path, data)
    }

    private async delete(path: string): Promise<AxiosResponse> {
        return await this.request("delete", path)
    }

    private async getBearer(): Promise<void> {
        const axios = useAxios();
        // Attempt authentication with CAS. It is assumed that CAS cookie
        // is already obtained via the CAS init startup service. This will
        // either bring us to a page where we forward CAS auth with campus
        // labs or the authenticated campus labs.
        var bearerRes = await axios.get(this.event.authUrl);

        // Check if already authenticated
        if ((bearerRes.request.res.responseUrl as string) != SUCCESSFUL_AUTH_URL) {
            // We are at a redirect page, so scrape and forward the
            // necessary information.
            const authRoot = parse(bearerRes.data);
            var postUrl = authRoot.querySelector("form")!.attributes.action
            const form = queryStringFromForm(authRoot.querySelector("form")!)
            const forwardRes = await axios.post(postUrl, form, X_WWW_FORM_HEADERS_CONFIG)
            log("(1/3) Got CampusLabs response")

            const campusForwardRoot = parse(forwardRes.data);
            var campusPostURL = campusForwardRoot.querySelector("form")!.attributes.action
            const campusForm = queryStringFromForm(campusForwardRoot.querySelector("form")!)
            const connectRes = await axios.post(campusPostURL, campusForm, X_WWW_FORM_HEADERS_CONFIG)
            log("(2/3) Got connect response")

            const connectRoot = parse(connectRes.data);
            const connectQuery = queryStringFromForm(connectRoot.querySelector("form")!)
            var connectPostUrl = connectRoot.querySelector("form")!.attributes.action
            var oidcRes = await axios.post(connectPostUrl, connectQuery, X_WWW_FORM_HEADERS_CONFIG)
            log("(3/3) Got Bearer!")

            bearerRes = oidcRes;
        } else {
            log("Already authenticated with CampusLabs!")
        }

        this.bearer = bearerRes.data.split("'")[1]
    }
}

class TerpLinkEventMemberProvider implements TerpLinkEventMember {

    private event: TerpLinkEvent;
    private id: number | null;
    private account: TerpLinkSchema.Account;

    constructor(id: number | null, account: TerpLinkSchema.Account, event: TerpLinkEvent) {
        this.id = id;
        this.account = account;
        this.event = event;
    }

    getAccount(): TerpLinkSchema.Account {
        return this.account;
    }

    getName(): string {
        return this.account.name;
    }

    getAttendeeId(): number {
        return this.id ?? -1;
    }

    getMemberId(): string {
        return this.account.id;
    }

    async checkIn(): Promise<void> {
        await this.event.checkIn(this.getMemberId());
    }

    async checkOut(): Promise<void> {
        await this.event.checkOut(this.getMemberId());
    }

    async remove(): Promise<void> {
        await this.event.remove(this.getAttendeeId());
    }

    toString(): string {
        return this.account.name;
    }
}

function getBaseUrl(url: string) {
    const split_url = url.split("/")
    if (split_url.length == 2) {
        // Just has two slashes, so prob is something like http://google.com
        return url;
    } else {
        return split_url.slice(0,3).join("/")
    }
}

const tl = new TerpLinkProvider();
export function useTerpLink(): TerpLink {
    return tl;
}