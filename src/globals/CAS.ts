import { GlobalConfig } from "payload/types";
import Members from "../collections/Members";

const CAS: GlobalConfig = {
    slug: 'cas',
    label: 'CAS',
    fields: [
        {
            name: 'username',
            type: 'text'
        },
        {
            name: 'password',
            type: 'text',
        },
        {
            name: 'duoDeviceName',
            type: 'text',
        },
        {
            name: 'hotpSecret',
            type: 'text'
        },
        {
            name: 'hotpCounter',
            type: 'number',
            defaultValue: 0
        }
    ]
};

export default CAS;