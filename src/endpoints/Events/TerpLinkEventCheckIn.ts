import { Endpoint } from "payload/dist/config/types";
import { resolveMember } from "../../collections/util/MembersUtil";
import XRC from "../../server/XRC";
import { makeAdminHandler } from "../RejectIfNoUser";

/**
 * The required parameters for event check in:
 *
 * a - event access code
 * m - member resolve method
 * v - member resolve data
 */
let requiredParameters = ["a", "m", "v"];

const EventCheckIn: Endpoint = {
  path: "/tl-checkin",
  method: "post",
  handler: makeAdminHandler(async (req, res) => {
    // Ensure all the required parameters are provided.
    for (var p of requiredParameters) {
      if (!req.query[p]) {
        res.status(400).json({ err: "Missing query parameter: " + p });
        return;
      }
    }

    let accessCode = req.query.a as string;
    let resolveMethod = req.query.m as string;
    let resolveContent = req.query.v as string;

    let tlEvent = await XRC.terplink.getEvent(accessCode);
    if (tlEvent) {
      let member = await resolveMember(resolveMethod as any, resolveContent);
      if (!member || !member.umd?.terplink?.accountId) return;

      res.status(200).send();

      // Get the event within the database.
      let eventSearch = await req.payload.find({
        collection: "events",
        where: {
          "terplink.accessCode": {
            equals: accessCode,
          },
        },
      });

      if (eventSearch.totalDocs == 1) {
        let event = eventSearch.docs[0];

        // Check the member in on terplink.
        tlEvent.checkIn(member.umd.terplink.accountId);

        // Create an attendance
        req.payload.create({
          collection: "attendances",
          data: {
            member: member.id,
            date: new Date().toString(),
            event: event.id,
            type: "in",
          },
        });
      }
    }
  }),
};

export default EventCheckIn;
