import payload from "payload";
import XRC from "./XRC";
import { GlobalSlugs } from "../slugs";
import { TerpLink, TerpLinkEvent } from "./terplink";
import { resolveDocument } from "./payload-backend";

var LabTerpLinkEvent: TerpLinkEvent | null;

/**
 * Fetches the TerpLink event for the specified lab event in Payload.
 */
export async function getLabTerpLinkEvent(): Promise<TerpLinkEvent> {
  if (!LabTerpLinkEvent) {
    // First retrieve the lab event from payload.
    let lab = await payload.findGlobal({
      slug: "lab",
    });

    if (lab.event) {
      let event = await resolveDocument(lab.event, "events");
      let accessCode = event.terplink.accessCode;
      if (accessCode) {
        LabTerpLinkEvent = await XRC.terplink.getEvent(accessCode);
      } else {
        // TODO: Don't throw errors, return null/undefined instead.
        throw new Error("Could not find access code for the lab event!");
      }
    } else {
      throw new Error("No TerpLink event defined!");
    }
  }

  return LabTerpLinkEvent!;
}
