import { GlobalConfig } from "payload/types";
import PasswordField from "../components/dashboard/PasswordField";
import { GlobalSlugs } from "../slugs";

const Odoo: GlobalConfig = {
    slug: GlobalSlugs.Odoo,
    fields: [
        {
            name: "url",
            type: "text"
        },
        {
            name: "db",
            type: "text"
        },
        {
            name: "uid",
            label: "User ID",
            type: "number"
        },
        {
            name: "password",
            type: "text",
            admin: {
                components: {
                    Field: PasswordField
                }
            }
        },
    ]
}

export default Odoo;