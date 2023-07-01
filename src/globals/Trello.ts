import { GlobalConfig } from "payload/types";
import { GlobalSlugs } from "../slugs";
import PasswordField from "../components/fields/PasswordField";
import TrelloTest from "../endpoints/Trello/TrelloTest";
import { TrelloWebhookHEADEndpoint, TrelloWebhookPOSTEndpoint } from "../endpoints/Trello/TrelloWebhookEndpoint";

const TrelloConfig: GlobalConfig = {
    slug: GlobalSlugs.Trello,
    endpoints: [ TrelloWebhookHEADEndpoint, TrelloWebhookPOSTEndpoint, TrelloTest ],
    fields: [
        {
            name: "key",
            type: "text"
        },
        {
            name: "secret",
            type: "text",
            admin: {
                components: {
                    Field: PasswordField
                }
            }
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

export default TrelloConfig;