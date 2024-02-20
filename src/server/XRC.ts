import { Axios } from 'axios';
import { ClubEventData } from "@xrclub/club.js/dist/events/event";
import {
    DiscordClubEventData, DiscordClubEventExtension
} from "@xrclub/club.js/dist/events/extensions/discord";
import {
    GCalClubEventData, GCalClubEventExtension
} from "@xrclub/club.js/dist/events/extensions/gcal";
import { Transformer } from "@xrclub/club.js/dist/util/transformer";
import payload from 'payload';
import { UMDVerificationManager } from '../endpoints/Members/UMDVerification';
import { useAxios } from "./axios";
import { Odoo } from './odoo';
import { TerpLink } from './terplink';
import { UMDDirectory } from './umd-directory';

export type XRCEvent = ClubEventData & DiscordClubEventData & GCalClubEventData;

class XRCManager
{
    public directory: UMDDirectory
    public axios: Axios
    public umd: UMDVerificationManager
    public terplink: TerpLink
    public odoo: Odoo
    public events: Transformer<XRCEvent>
    private _discordEventExtension: DiscordClubEventExtension<XRCEvent>
    private _gcalEventExtension: GCalClubEventExtension<XRCEvent>

    constructor() {
        this.axios = useAxios();
        this.directory = new UMDDirectory(this.axios);
        this.terplink = new TerpLink(this.axios);
        this.odoo = new Odoo();
        this.umd = new UMDVerificationManager();

        // Initialize events
        this.events = new Transformer();
        this._discordEventExtension = new DiscordClubEventExtension({});
        this._gcalEventExtension = new GCalClubEventExtension([]);
        this.events.addExtension(this._discordEventExtension);
        this.events.addExtension(this._gcalEventExtension);
    }

    public async init() {
        // Configure Discord events
        var guilds: Record<string, string | null> = {}
        let bot = await payload.findGlobal({ slug: "bot" })
        let guildId = bot.guild?.guildId;
        let eventChannel = bot.guild?.channels?.events;

        if (guildId) {
            guilds[guildId] = eventChannel ?? null;
        }

        console.log(guilds)
        this._discordEventExtension.setGuilds(guilds);

        // Configure Google Calendar
        let gapi = await payload.findGlobal({
            slug: "gapi"
        })

        if (gapi.eventsCalendarId) {
            this._gcalEventExtension.setCalendarIds([gapi.eventsCalendarId])
        } else {
            this._gcalEventExtension.setCalendarIds([])
        }
    }


}

const XRC = new XRCManager();

export function useTerpLink() {
    return XRC.terplink;
}

export function useDirectory() {
    return XRC.directory;
}

export function useOdoo() {
    return XRC.odoo;
}

export function useUMDVerifier() {
    return XRC.umd;
}

export default XRC;