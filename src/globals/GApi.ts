import { GlobalConfig } from "payload/types";
import { setGApiAuthentication } from "@xrclub/club.js/dist/gapi/auth";

const GApi: GlobalConfig = {
    slug: "gapi",
    fields: [
        {
            name: "clientId",
            type: "text"
        },
        {
            name: "clientSecret",
            type: "text"
        },
        {
            name: "refreshToken",
            type: "text"
        },
        {
            name: "eventsCalendarId",
            type: "text"
        }
    ]
}

export default GApi;