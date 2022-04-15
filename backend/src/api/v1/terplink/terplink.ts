import { Request, Response } from "express";
import { XRCSchema } from "xrc-schema";
import { TerpLinkEvent, TerpLinkEventMember, useTerpLink } from "../../../util/terplink";
import { APIRoute } from "../../api";
import { respondError, respondSuccess } from "../v1";

/**
 * Handles an incoming request that will lookup a TerpLink event. The handle
 * function should process the event in some capacity.
 *
 * @param req The client request
 * @param res The client response
 * @param handle A handler for the TerpLink event once processed
 */
async function eventRequest(req: Request, res: Response, handle: (e: TerpLinkEvent) => Promise<void>) {
    const tl = useTerpLink();
    const { eventcode } = req.params;

    // Check to see if the provided TerpLink event code is valid.
    let tle = await tl.getEvent(eventcode);
    if (tle)
        await handle(tle);
    else
        respondError(res, "The specified event code is invalid!");
}

/**
 * Handles an incoming request that will perform some action on a TerpLink
 * member. Every request must have a valid TerpLink code and a valid instance
 * ID for the member. The handle function should return the data to be send
 * back to the client.
 *
 * @param req The client request
 * @param res The client response
 * @param handle A handler for the TerpLink member once processed
 */
async function memberRequest(req: Request, res: Response, handle: (m: TerpLinkEventMember) => Promise<any>): Promise<void> {
    // Check that an instance id was provided with the request. We need it
    // to lookup the member to check in.
    if (req.query.instanceId) {
        // Check to see if the provided TerpLink event code is valid.
        await eventRequest(req, res, async (tle) => {
            // Check to see that the provided instanceId is valid.
            var member: TerpLinkEventMember
            try {
                member = await tle.getMemberFromIssuanceId(req.query.instanceId as string);
            } catch {
                respondError(res, "The specified instance id is invalid!");
                return;
            }

            // Perform the member action
            try {
                let data = await handle(member);
                respondSuccess(res, data);
            } catch {
                respondError(res, "An internal error occurred while checking the member in", true);
            }
        })
    } else {
        respondError(res, "No instance id provided!");
    }
}

/**
 * Checks-in a specified member based on their instance id.
 */
export const checkin_post: APIRoute = {
    path: "/terplink/:eventcode/checkin",
    method: "post",
    handler: async (req, res) => {
        memberRequest(req, res, async (member) => {
            await member.checkIn();
            return (member.getAccount());
        })
    }
}

export const checkout_post: APIRoute = {
    path: "/terplink/:eventcode/checkout",
    method: "post",
    handler: async (req, res) => {
        memberRequest(req, res, async (member) => {
            await member.checkOut();
            return (member.getAccount());
        })
    }
}

export const remove_post: APIRoute = {
    path: "/terplink/:eventcode/remove",
    method: "post",
    handler: async (req, res) => {
        memberRequest(req, res, async (member) => {
            await member.remove();
            return (member.getAccount());
        })
    }
}

export const event_get: APIRoute = {
    path: "/terplink/:eventcode",
    method: "get",
    handler: async (req, res) => {
        await eventRequest(req, res, async (tle) => {
            const event: XRCSchema.ClubEvent = {
                name: tle.getEventName(),
                startDate: tle.getStartDate().toUTCString(),
                endDate: tle.getEndDate().toUTCString(),
                imageUrl: tle.getImageURL()
            };
            respondSuccess(res, event);
        })
    }
}

export const terplink: APIRoute[] = [event_get, checkin_post, checkout_post, remove_post]