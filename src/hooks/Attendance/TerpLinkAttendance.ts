import payload from "payload";
import { CollectionAfterChangeHook } from "payload/types";
import XRC from "../../server/XRC";
import { CollectionSlugs } from "../../slugs";

async function checkInOrOut(
  memberId: string,
  accessCode: string,
  type: string
) {
  let tlEvent = await XRC.terplink.getEvent(accessCode);
  try {
    if (type == "in") {
        await tlEvent.checkIn(memberId);
      } else {
        await tlEvent.checkOut(memberId);
      }
  } catch {
    console.error("Could not check in/out of event w/ access code: " + accessCode)
    return;
  }

  console.log("Checked in/out member with id: " + memberId);
}

/**
 * For every attendance created, if the event the TerpLink event has an access
 * code and the member has a TerpLink account id, then this hook will also
 * check them in/out on TerpLink.
 */
const TerpLinkAttendanceHook: CollectionAfterChangeHook = async (args) => {
  // Only perform the check in/out operation on newly created attendance
  // events.
  if (args.operation === "create") {
    var { member, event, type } = args.doc;
    // Resolve member if its just a string.
    if (typeof member === "string") {
      member = await payload.findByID({
        collection: "members",
        id: member,
      });
    }

    // Resolve event if its just a string.
    if (typeof event === "string") {
      event = await payload.findByID({
        collection: "events",
        id: event,
      });
    }

    // Attempt to fetch the member id and access code.
    let memberId = member.umd?.terplink?.accountId;
    let accessCode = event.terplink?.accessCode;

    // If they both exist, check the member in/out depending on the attendance type.
    // We also don't need this to finish in order to create an event, so we
    // call this async function without awaiting it.
    if (memberId && accessCode) {
      checkInOrOut(memberId, accessCode, type);
    }
  }
};

export default TerpLinkAttendanceHook;
