import { APIRoute } from "../../api";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { useXRCHost } from "../../../util/xrc-host-file";

const CAS_LOGIN_URL = "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/login";
const CAS_VERIFY_URL = "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/serviceValidate";
const TIME_TO_VERIFY = 15 * 60 * 1000;

const pendingVerification = new Map<string, { service: string, discordId: string }>();

function createAuthURL(discordId: string): string {
    const host = useXRCHost();
    const serviceUUID = uuid();
    const callbackUrl = host.publicURL + "api/v1/auth/uid/" + serviceUUID;

    // Add service UUID to list
    pendingVerification.set(serviceUUID, {
        service: callbackUrl,
        discordId: discordId
    });

    // Remove service UUID from list if it has been too long.
    setTimeout(() =>
        pendingVerification.delete(serviceUUID),
    TIME_TO_VERIFY);

    const authURL = CAS_LOGIN_URL + "?service=" + encodeURIComponent(callbackUrl);

    return authURL;
}

async function verifyCASTicket(serviceId: string, ticket: string): Promise<string> {
    const verify = pendingVerification.get(serviceId);
    if (verify) {
        var response = await axios.get(CAS_VERIFY_URL, {
            params: {
                service: verify.service,
                ticket: ticket
            }
        })

        if (response.status == 200) {
            const re = /<cas:user>(.*)<\/cas:user>/;
            var matches = re.exec(response.data);
            if (matches && matches?.length > 0) {
                // Remove the service ID from use due to successful auth.
                pendingVerification.delete(serviceId);

                var uid = matches[1];
                return uid;
            }
        }
    }

    throw new Error("Unable to verify CAS ticket!");
}

export const uid_get: APIRoute = {
    path: "/auth/uid",
    method: "get",
    handler: async (req, res) => {
        if (req.query.discordId) {
            res.status(200).send({url: createAuthURL(req.query.discordId as string)});
        } else {
            res.status(400).send();
        }
    }
}

/**
 * Handles the redirect from the UMD CAS server and stores the directory ID in
 * the member database.
 */
export const uid_post: APIRoute = {
    path: "/auth/uid/:serviceId",
    method: "get",
    handler: async (req, res) => {
        const { serviceId } = req.params;
        const { ticket } = req.query;
        if (ticket) {
            const ticket = req.query.ticket as string;
            try {
                const uid = await verifyCASTicket(serviceId, ticket);
                console.log("Did auth: " + uid);
                res.status(200).send("Welcome, " + uid);
            } catch {
                res.status(400).send();
            }
        }
    }
}