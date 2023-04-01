import { PayloadHandler } from "payload/config"

export function validateQueryParameters(params: string[]): PayloadHandler {

    return async (req, res, next) => {
        for (var param of params) {
            if (!req.query[param]) {
                res.status(400).send({error: "Missing parameter: " + param})
                return;
            }
        }

        next()
    }
}