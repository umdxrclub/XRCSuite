import payload from "payload";
import XRC from "./XRC";
import { GlobalSlugs } from "../slugs";
import { TerpLink, TerpLinkEvent } from "./terplink";
import { resolveDocument } from "./payload-backend";

var LabTerpLinkEvent: TerpLinkEvent | null;

/**
 * Fetches the TerpLink event for the specified lab event in Payload.
 */
export async function getLabTerpLinkEvent(): Promise<TerpLinkEvent | null> {
  if (!LabTerpLinkEvent) {
    // First retrieve the lab event from payload.
    let lab = await payload.findGlobal({
      slug: "lab",
    });

    if (lab.event) {
      let event = await resolveDocument(lab.event, "events");
      let accessCode = event.terplink?.accessCode;
      if (accessCode) {
        LabTerpLinkEvent = await XRC.terplink.getEvent(accessCode);
      } else {
        // TODO: Don't throw errors, return null/undefined instead.
        payload.logger.warn("Cannot find access code for lab event.")
      }
    } else {
      payload.logger.warn("No Lab event is currently defined.")
    }
  }

  return LabTerpLinkEvent!;
}
