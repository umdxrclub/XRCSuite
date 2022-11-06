import { CollectionConfig } from "payload/types";

const DEVICE_TYPES: string[] = [
    "Desktop",
    "Laptop",
    "VR Headset",
    "AR Headset",
    "Phone"
]

const Devices: CollectionConfig = {
    slug: 'devices',
    admin: {
        useAsTitle: 'name'
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'type',
            type: 'select',
            options: DEVICE_TYPES
        },
        {
            name: 'serialNumber',
            type: 'text'
        }
    ]
}

export default Devices;