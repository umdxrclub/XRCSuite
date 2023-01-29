import { GlobalConfig } from "payload/types";
import Members from "../collections/Members";
import PasswordField from "../components/dashboard/PasswordField";

const CAS: GlobalConfig = {
    slug: 'cas',
    label: 'CAS',
    access: {
        read: (args) => {
            return args.req.user.casManager
        }
    },
    fields: [
        {
            name: 'username',
            type: 'text'
        },
        {
            name: 'password',
            type: 'text',
            admin: {
                components: {
                    Field: PasswordField
                }
            }
        },
        {
            name: 'duoDeviceName',
            type: 'text',
        },
        {
            name: 'hotpSecret',
            type: 'text',
            admin: {
                components: {
                    Field: PasswordField
                }
            }
        },
        {
            name: 'hotpCounter',
            type: 'number',
            defaultValue: 0
        }
    ]
};

export default CAS;