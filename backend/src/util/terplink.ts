import { AxiosResponse } from "axios";
import { parse } from "node-html-parser";
import querystring from "querystring";
import { queryStringFromForm, X_WWW_FORM_HEADERS_CONFIG } from "./scrape-util";
import { useAxios } from "./shared-axios";
import { TerpLinkSchema } from "xrc-schema";



const CAMPUS_LABS_API_URL = "https://se-app-checkins.campuslabs.com/v4.0/";
const SUCCESSFUL_AUTH_URL = "https://terplink.umd.edu/account/tokens?isMobile=true";
export const XR_CLUB_ID = 279233
export const TEPRLINK_API_URL = "https://terplink.umd.edu/api"
export const TERPLINK_API_LOGIN_URL = "https://terplink.umd.edu/account/login?returnUrl=%2F"

function log(msg: string) {
    console.log(`[TerpLink] ${msg}`)
}

/**
 * TerpLink is a UMD service used by clubs to manage events and rosters. This
 * interface provides the methods that should be implemented by some TerpLink
 * provider. A TerpLink provider may include a controller that runs an emulator
 * that manages the Check-in app, or something that makes the API calls directly.
*/
class TerpLink {
    private events: Map<string, TerpLinkEvent> = new Map();
    private apiBearer: string | undefined = undefined

    async getBearer() {
        const axios = useAxios();
        let loginRes = await axios.get(TERPLINK_API_LOGIN_URL)
        console.log(loginRes.data)
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

        const event = new TerpLinkEvent(eventData);
        this.events.set(eventCode, event);
        return event;
    }

    async getEvents(organizationId: number) {
        const axios = useAxios();

        const res = await axios.get("https://terplink.umd.edu/api/comp-events/graphql/getEvents", {
            data: {
                query: `query ($skip: Int, $take: Int, $organizationIds: [Int], $startsAfter: String, $endsBefore: String, $nameContains: String, $status: String, $themes: [String], $isOnline: String, $orderByField: String, $orderByDirection: String, $forceOrderBy: Boolean) {
                    getEvents(
                      skip: $skip
                      take: $take
                      organizationIds: $organizationIds
                      startsAfter: $startsAfter
                      endsBefore: $endsBefore
                      nameContains: $nameContains
                      status: $status
                      themes: $themes
                      isOnline: $isOnline
                      orderByField: $orderByField
                      orderByDirection: $orderByDirection
                      forceOrderBy: $forceOrderBy
                    ) {
                      totalItems
                      items {
                        id
                        name
                        description
                        startsOn
                        endsOn
                        state {
                          status
                          __typename
                        }
                        rsvpStatistics {
                          invitedUserCount
                          yesUserCount
                          yesGuestCount
                          __typename
                        }
                        organization {
                          id
                          name
                          websiteKey
                          __typename
                        }
                        __typename
                      }
                      __typename
                    }
                  }`,
                variables: {
                    "take": 10,
                    "organizationIds": [
                      organizationId
                    ],
                    "skip": 0,
                    "forceOrderBy": false,
                    "orderByField": "StartDateTime",
                    "orderByDirection": "1"
                  }
            }
        })

        console.log(res.data)
    }
}

/**
 * A TerpLink event is some club event that has some start/end time and a roster.
 * Members are checked in/out of the event as it progresses.
 */
class TerpLinkEvent {
    private event: TerpLinkSchema.Event;
    private bearer: string = "";

    constructor(event: TerpLinkSchema.Event) {
        this.event = event;
    }

    /**
     * Returns the name of the event.
     */
    getEventName(): string {
        return this.event.name;
    }

    /**
     * Gets the start time of the event.
     */
    getStartDate(): Date {
        return new Date(this.event.startsOn);
    }

    /**
     * Gets the end time of the event.
     */
    getEndDate(): Date {
        return new Date(this.event.endsOn);
    }

    /**
     * Gets the image URL associated with the event.
     */
    getImageURL(): string {
        return this.event.imagePath;
    }

    /**
     * Checks in a member with a given member id.
     *
     * @param memberId The member id to check in
     */
    async checkIn(memberId: string): Promise<void> {
        await this.post("attendance/checkin", {
            accountId: memberId,
            email: null
        })
    }

    /**
     * Checks out a member with a given member id.
     *
     * @param memberId The member id to check in
     */
    async checkOut(memberId: string): Promise<void> {
        await this.post("attendance/checkout", {
            accountId: memberId,
            email: null
        })
    }

    /**
     * Checks in a member with a given member id.
     *
     * @param attendanceId The attendance id to remove
     */
    async remove(attendeeId: number): Promise<void> {
        await this.delete(`attendance/${attendeeId}`);
    }

    /**
     * Searches up members by a given query.
     *
     * @param query Names to search for
     */
    async lookupMembers(query: string): Promise<TerpLinkEventMember[]> {
        const queryForm = querystring.stringify({
            query: query,
            take: 50,
            skip: 0
        })

        const res = await this.get(`member?${queryForm}`);
        const members = res.data.items as TerpLinkSchema.Member[]
        return members.map(member => new TerpLinkEventMember(member.attendanceId, member.account, this));
    }

    /**
     * Gets a member based on their issuance id, which is typically found on
     * the TerpLink event pass.
     *
     * @param issuanceId The issuanceId to search for.
     */
    async getMemberFromIssuanceId(issuanceId: string): Promise<TerpLinkEventMember> {
        const res = await this.get(`member?issuanceId=${issuanceId}&skip=0&take=10`)
        if ((res.data.items as any[]).length > 0) {
            const member = res.data.items[0] as TerpLinkSchema.Member;
            return new TerpLinkEventMember(member.attendanceId, member.account, this);
        }

        throw new Error("No member found!");
    }

    /**
     * Gets all attendees of the event.
     *
     * @param withLogAction If provided, filters the attendees based on whether
     * they are checked in/out.
     * @param includeRemoved If provided, whether to include attendees that have
     * been removed.
     */
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

        return attendees.map(attendee => new TerpLinkEventMember(attendee.id, attendee.account, this));
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

/**
 * A member is someone who is eligible to participate in a TerpLink event.
 * Members can be checked in/out and removed.
 */
class TerpLinkEventMember {

    private event: TerpLinkEvent;
    private id: number | null;
    private account: TerpLinkSchema.Account;

    constructor(id: number | null, account: TerpLinkSchema.Account, event: TerpLinkEvent) {
        this.id = id;
        this.account = account;
        this.event = event;
    }

    /**
     * Get's the member's account
     */
    getAccount(): TerpLinkSchema.Account {
        return this.account;
    }

    /**
     * Gets the name of the member.
     */
    getName(): string {
        return this.account.name;
    }

    /**
     * Gets the member ID of the member.
     */
    getAttendeeId(): number {
        return this.id ?? -1;
    }

    /**
     * Gets the member ID of the member.
     */
    getMemberId(): string {
        return this.account.id;
    }

    /**
     * Checks the member in.
     */
    async checkIn(): Promise<void> {
        await this.event.checkIn(this.getMemberId());
    }

    /**
     * Checks the member out.
     */
    async checkOut(): Promise<void> {
        await this.event.checkOut(this.getMemberId());
    }

    /**
     * Removes the member from the event.
     */
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

const tl = new TerpLink();
export function useTerpLink(): TerpLink {
    return tl;
}