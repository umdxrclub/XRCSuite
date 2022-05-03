import { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from "axios";
import parse from "node-html-parser";
import querystring from "querystring";
import { TerpLinkSchema } from "xrc-schema";
import { MODELS } from "../data/DatabaseService";
import { queryStringFromForm, wasRequestRedirectedTo, X_WWW_FORM_HEADERS_CONFIG } from "./scrape-util";
import { useAxios } from "./shared-axios";
import { useXRCHost } from "./xrc-host-file";

const CAMPUS_LABS_API_URL = "https://se-app-checkins.campuslabs.com/v4.0/";
const TERPLINK_FEDERATION_URL = "https://federation.campuslabs.com"
const TERPLINK_TOKEN_URL = "https://terplink.umd.edu/account/login?ReturnUrl=%2Faccount%2Ftokens%3FisMobile%3Dtrue"
const TERPLINK_API_URLS = [
    "https://terplink.umd.edu/api",
    CAMPUS_LABS_API_URL
]

export const XR_CLUB_ID = 279233

function log(msg: string) {
    console.log(`[TerpLink] ${msg}`)
}

/**
 * TerpLink is a UMD service used by clubs to manage events and rosters. This
 * interface provides the methods that should be implemented by some TerpLink
 * provider. A TerpLink provider may include a controller that runs an emulator
 * that manages the Check-in app, or something that makes the API calls directly.
*/
export class TerpLink {
    private events: Map<string, TerpLinkEvent> = new Map();
    private bearer: string | undefined = undefined
    static singleton: TerpLink = new TerpLink()

    constructor() {
        const axios = useAxios();
        axios.interceptors.request.use(this.terplinkRequestInterceptor.bind(this));
        axios.interceptors.response.use(this.terplinkResponseInterceptor.bind(this));
    }

    /**
     * Gets the semester-long lab event that can be used for searching members. 
     */
    async getLabEvent() {
        const host = useXRCHost();
        if (host.terplink.labEventCode) {
            return await this.getEvent(host.terplink.labEventCode);
        }

        throw new Error("Could not get lab event!");
    }

    /**
     * Intercepts requests going to the TerpLink API to add the Bearer token.
     * @param req 
     * @returns 
     */
    private async terplinkRequestInterceptor(req: AxiosRequestConfig<any>) {
        if (TERPLINK_API_URLS.find(url => req.url?.startsWith(url))) {
            // Get the bearer token if it is currently an empty string
            if (this.bearer == undefined) {
                await this.getBearer();
            }

            // Inject Bearer
            req.headers = {
                ...req.headers,
                Authorization: `Bearer ${this.bearer}`
            }

            // Allow unauthorized
            req.validateStatus = (status) => {
                return status < 300 || status == 401;
            }
        }
        
        return req
    }

    /**
     * Intercepts responses from the TerpLink API to either sign in or fetch
     * a new bearer token.
     * 
     * @param res
     * @returns 
     */
    private async terplinkResponseInterceptor(res: AxiosResponse<any, any>) {
        const axios = useAxios();
        let reqUrl = res.config.url!
        let responseUrl = res.request.res.responseUrl as string

        if (wasRequestRedirectedTo(reqUrl, responseUrl, TERPLINK_FEDERATION_URL)) {
            console.log("Intercepting TerpLink Login...")
            const identityRoot = parse(res.data);
            var campusPostURL = identityRoot.querySelector("form")!.attributes.action
            const campusForm = queryStringFromForm(identityRoot.querySelector("form")!)
            const connectRes = await axios.post(campusPostURL, campusForm, X_WWW_FORM_HEADERS_CONFIG)
            log("(1/2) Got Identity Response")

            const connectRoot = parse(connectRes.data);
            const connectForm = connectRoot.querySelector("form")!
            const connectQuery = queryStringFromForm(connectForm)
            var connectPostUrl = connectRoot.querySelector("form")!.attributes.action
            var oidcRes = await axios.post(connectPostUrl, connectQuery, X_WWW_FORM_HEADERS_CONFIG)
            log("(2/2) Signed in to OIDC!")

            res = oidcRes
        }

        // Stale token
        if (TERPLINK_API_URLS.find(url => res.config.url?.startsWith(url)) && res.status == 401) {
            await this.getBearer()

            // Try the request again, but fail if the status isn't 200
            res = await axios.request({...res.config,
                validateStatus: status => status == 200,
                httpAgent: undefined, httpsAgent: undefined})
        }

        return res;
    }
    
    private async getBearer(): Promise<void> {
        const axios = useAxios();

        // Get the bearer from the token url
        var bearerRes = await axios.get(TERPLINK_TOKEN_URL);

        // Extract bearer
        this.bearer = bearerRes.data.split("'")[1]
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
        } catch (e) {
            console.log(e)

            // If there was a 400 err, return null.
            return null;
        }

        let eventData = eventRes.data as TerpLinkSchema.Event;

        const event = new TerpLinkEvent(eventData);
        this.events.set(eventCode, event);
        return event;
    }

    async getRosterPage(page: number) {
        const axios = useAxios()
        const res = await axios.get("https://terplink.umd.edu/actioncenter/organization/xr-club/roster?Direction=Ascending&Page=" + page, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const body = parse(res.data);
        const matches = body.querySelectorAll(`input[type=checkbox]`)
        const pagination = body.querySelector('div[class=pagination]')!
        const navLinks = pagination.querySelectorAll("a")
        const last = navLinks[navLinks.length - 1].attributes["href"].split("Page=")[1]
        return {
            members: matches.map(e => {
                const membercard = e.attributes["value"]
                const name = e.attributes["title"].split("Select ")[1]
                
                return {
                    communityId: membercard,
                    name: name.slice(1,name.length-1)
                }
            }),
            lastPage: last
        }
    }

    async getEmailFromCommunityId(communityId: string) {
        const axios = useAxios();
        const res = await axios.get(`https://terplink.umd.edu/actioncenter/organization/xr-club/roster/users/membercard/${communityId}`)
        const body = parse(res.data);
        const email = body.querySelector("a[class=email]")?.attributes["href"].split("mailto:")[1]
        return email!
    }

    async getEventPage(eventId: number) {
        const axios = useAxios();

        const pageUrl = `https://terplink.umd.edu/actioncenter/organization/xr-club/events/calendar/details/${eventId}`
        const res = await axios.get(pageUrl)

        console.log(res.data)
    }

    async getEvents(organizationId: number) {
        const axios = useAxios();

        const res = await axios.post("https://terplink.umd.edu/api/comp-events/graphql/getEvents", {
            data: {
                query: `query () {
                    __schema() {
                        types {
                          name
                        }
                      }
                }`,

                variables: {}
            }
        });

        return res.data;

        const res2 = await axios.get("https://terplink.umd.edu/api/comp-events/graphql/getEvents", {
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

        return res.data
    }
}

/**
 * A TerpLink event is some club event that has some start/end time and a roster.
 * Members are checked in/out of the event as it progresses.
 */
export class TerpLinkEvent {
    private event: TerpLinkSchema.Event;

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
            const tlMember = res.data.items[0] as TerpLinkSchema.Member;

            // If there is an account ID in the database, store the issuance
            // id with it for faster lookup
            await MODELS.member.update({ tl_issuance_id: issuanceId }, {
                where: {
                    tl_account_id: tlMember.account.id
                }
            })

            return new TerpLinkEventMember(tlMember.attendanceId, tlMember.account, this);
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

        var res = await axios.request({
            url: CAMPUS_LABS_API_URL + `event/${this.event.accessToken}/${path}`,
            method: method,
            data: data,
        })

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
}

/**
 * A member is someone who is eligible to participate in a TerpLink event.
 * Members can be checked in/out and removed.
 */
export class TerpLinkEventMember {

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