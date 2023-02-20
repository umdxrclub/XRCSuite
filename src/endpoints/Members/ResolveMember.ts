import { Endpoint } from "payload/dist/config/types";
import { resolveMember } from "../../collections/util/MembersUtil";
import { makeAdminHandler } from "../RejectIfNoUser";

const ResolveMemberEndpoint: Endpoint = {
    path: "/resolve",
    method: "post",
    handler: makeAdminHandler(async (req, res, next) => {
        // m: resolve method
        // v: method value
        if (typeof(req.query.m) === "string" && typeof(req.query.v) === "string" && req.query.v.length > 0) {
            let member = await resolveMember(req.query.m as any, req.query.v);

            console.log(member)

            // Send successful response.
            res.status(200).json(member)
        } else {
            res.status(400).send()
        }
    })
}

export default ResolveMemberEndpoint;