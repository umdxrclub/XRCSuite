import { GlobalConfig } from "payload/types";
import { GlobalSlugs } from "../slugs";
import PasswordField from "../components/fields/PasswordField";
import TrelloTest from "../endpoints/Trello/TrelloTest";
import TrelloWebhookEndpoint from "../endpoints/Trello/TrelloWebhookEndpoint";

const Trello: GlobalConfig = {
    slug: GlobalSlugs.Trello,
    endpoints: [ TrelloWebhookEndpoint, TrelloTest ],
    fields: [
        {
            name: "key",
            type: "text"
        },
        {
            name: 'token',
            type: 'text',
            admin: {
                components: {
                    Field: PasswordField
                }
            }
        },
        {
            name: "organization",
            type: "text"
        }
    ]
}

export default Trello;