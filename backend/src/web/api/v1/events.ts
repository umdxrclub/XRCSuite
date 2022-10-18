import { XRCSchema } from '@xrc/XRCSchema';
import { Member } from 'data/MemberManager';
import XRC from '../../../data/XRC';
import { APIRoute } from '../api';

const events_checkIn: APIRoute = {
    path: "events/checkin",
    handlers: {
        "post": async (req, res) => {
            // Check if TerpLink issuance ID was provided 
            if (req.query.tlIssuanceId && req.query.tlEventCode) {
                let issuanceId = req.query.tlIssuanceId as string;
                let tlEventCode = req.query.tlEventCode as string;

                let event = await XRC.events.getEventByAccessCode(tlEventCode);
                if (event) {
                    let tlEvent = await event.getTerpLinkEvent();
                    let tlMember = await tlEvent?.getMemberFromIssuanceId(issuanceId)

                    if (tlMember) {
                        await tlMember.checkIn()

                        let response: XRCSchema.LabCheckInResult = {
                            name: tlMember.getRosterName(),
                            type: "checkin"
                        }

                        return {
                            success: true,
                            data: response
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
