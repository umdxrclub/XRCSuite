import { group } from "console";
import { CollectionConfig, Field } from "payload/types";
import { CollectionSlugs } from "../slugs";
import Devices from "./Devices";

const WiFiNetworkFields: Field[] = [
    {
        name: 'ssid',
        type: 'text',
        label: 'SSID'
    },
    {
        name: 'bssid',
        type: 'text',
        label: 'BSSID'
    },
    {
        name: 'level',
        type: 'number'
    }
]

const Heartbeats: CollectionConfig = {
    slug: CollectionSlugs.Heartbeats,
    admin: {
        group: "Audit",
    },
    fields: [
        {
            name: 'device',
            type: 'relationship',
            relationTo: Devices.slug
        },
        {
            name: 'date',
            type: 'date'
        },
        {
            name: 'location',
            type: 'point',
            admin: {
                description: "A location can be determined if the device sent its location or provided enough nearby WiFi networks to locate the device via Google's network-based location API."
            }
        },
        {
            name: 'battery',
            type: 'group',
            fields: [
                {
                    name: 'level',
                    type: 'number'
                },
                {
                    name: 'charging',
                    type: 'checkbox'
                }
            ]
        },
        {
            name: 'network',
            type: 'group',
            fields: [
                {
                    name: 'ipAddress',
                    label: 'IP Address',
                    type: 'text',
                },
                {
                    name: 'wifi',
                    label: 'Wi-Fi',
                    type: 'group',
                    fields: [
                        {
                            name: 'current',
                            type: 'group',
                            label: 'Current Network',
                            fields: WiFiNetworkFields
                        },
                        {
                            name: 'nearbyNetworks',
                            type: 'array',
                            fields: WiFiNetworkFields
                        }
                    ]
                }
            ]
        },
    ]
}

export default Heartbeats;