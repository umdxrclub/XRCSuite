import { XRCSchema } from '@xrc/XRCSchema';
import XRC from '../../../data/XRC';
import { APIRoute } from '../api';

const events_checkIn: APIRoute = {
    path: "events/checkin",
    handlers: {
        "post": async (req, res) => {
            let body = req.body as XRCSchema.EventsCheckInBody;
            let member = await XRC.members.getMember(body);

            if (member) {
                let query = req.query as XRCSchema.EventsCheckInQueryParameters;

                if (query.tlEventCode) {
                    let event = await XRC.events.getEventByAccessCode(query.tlEventCode);
                    if (event) {
                        let type = await event.checkInOrOut(member)

                        if (type) {
                            let memberAttributes = member.getAttributes()
                            let data: XRCSchema.CheckInResult = {
                                name: memberAttributes.name ?? "unknown",
                                isClubMember: true,
                                type: type
                            }

                            return {
                                success: true,
                                data: data
                            }
                        }
                    }
                }
            }

            return {
                success: false,
                error: "Could not find the specified member!",
                data: null
            }
        }
    }
}

export const EventsRoutes = [events_checkIn];
