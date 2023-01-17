import payload from "payload";
import XRC from "./XRC";
import { GlobalSlugs } from "../slugs";
import { TerpLink, TerpLinkEvent } from "./terplink";

var LabTerpLinkEvent: TerpLinkEvent | undefined;

/**
 * Fetches the TerpLink event for the specified lab event in Payload.
 */
export async function getLabTerpLinkEvent(): Promise<TerpLinkEvent> {
    if (!LabTerpLinkEvent) {
        // First retrieve the lab event from payload.
        let lab = await payload.findGlobal({
            slug: GlobalSlugs.Lab
        })

        let accessCode = lab.event.terplink.accessCode;
        if (accessCode) {
            LabTerpLinkEvent = await XRC.terplink.getEvent(accessCode);
        } else {
            throw new Error("Could not find access code for the lab event!");
        }
    }

    return LabTerpLinkEvent;
}