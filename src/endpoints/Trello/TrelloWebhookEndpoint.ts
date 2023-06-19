import { Endpoint } from "payload/config"

const TrelloWebhookEndpoint: Endpoint = {
    path: "/webhook",
    method: "post",
    handler: async (req, res) => {

    }
}

export default TrelloWebhookEndpoint;