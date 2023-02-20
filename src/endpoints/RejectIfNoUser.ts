import { PayloadHandler } from "payload/config";

export const RejectIfNoUserHandler: PayloadHandler = async (req, res, next) => {
    if (!req.user) {
        res.status(401).send({ error: "No user" })
    } else {
        next()
    }
} 

export function makeAdminHandler(handler: PayloadHandler): PayloadHandler[] {
    return [RejectIfNoUserHandler, handler]
}
