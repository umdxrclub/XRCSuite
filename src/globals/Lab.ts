import { Collection } from "discord.js";
import { GlobalConfig } from "payload/types";
import Events from "../collections/Events";
import Members from "../collections/Members";
import Schedules from "../collections/Schedules";
import LabCheckIn from "../endpoints/Lab/LabCheckIn";
import LabMediaEndpoint from "../endpoints/Lab/LabMedia";
import LabStatusEndpoint from "../endpoints/Lab/LabStatus";
import LabStatusHook from "../hooks/Lab/LabStatus";
import { CollectionSlugs } from "../slugs";
import Carousels from "../collections/Carousels";

const Lab: GlobalConfig = {
    slug: 'lab',
    endpoints: [ LabCheckIn, LabStatusEndpoint, LabMediaEndpoint ],
    hooks: {
        afterChange: [ LabStatusHook ]
    },
    fields: [
        {
            name: 'open',
            type: 'checkbox',
            defaultValue: false,
            required: true
        },
        {
            name: 'event',
            type: 'relationship',
            relationTo: Events.slug
        },
        {
            name: 'carousel',
            type: 'relationship',
            relationTo: Carousels.slug
        },
        {
            name: 'members',
            type: 'relationship',
            relationTo: Members.slug,
            hasMany: true,
        },
        {
            name: 'schedule',
            type: 'relationship',
            relationTo: Schedules.slug
        },
        {
            name: 'media',
            type: 'group',
            fields: [
                {
                    name: 'gatekeeper',
                    type: 'group',
                    fields: [
                        {
                            name: "acceptSound",
                            type: "upload",
                            relationTo: CollectionSlugs.Media,
                            filterOptions: {
                                mimeType: { contains: 'audio' }
                            }
                        },
                        {
                            name: "rejectSound",
                            type: "upload",
                            relationTo: CollectionSlugs.Media,
                            filterOptions: {
                                mimeType: { contains: 'audio' }
                            }
                        }
                    ]
                },
                {
                    name: "labOpenImage",
                    type: "upload",
                    relationTo: CollectionSlugs.Media,
                    filterOptions: {
                        mimeType: { contains: 'image' }
                    }
                },
                {
                    name: "labClosedImage",
                    type: "upload",
                    relationTo: CollectionSlugs.Media,
                    filterOptions: {
                        mimeType: { contains: 'image' }
                    }
                },
                {
                    name: "tvBanner",
                    type: "upload",
                    relationTo: CollectionSlugs.Media,
                    filterOptions: {
                        mimeType: { contains: 'image' }
                    }
                },
            ]
        },
        {
            name: 'discord',
            type: 'group',
            fields: [
                {
                    name: 'labMessage',
                    type: 'relationship',
                    relationTo: CollectionSlugs.Messages
                },
                {
                    name: 'labControlMessage',
                    type: 'relationship',
                    relationTo: CollectionSlugs.Messages
                },
                {
                    name: 'labNotificationsRole',
                    type: 'relationship',
                    relationTo: CollectionSlugs.Roles
                }
            ]
        },
        {
            name: 'settings',
            type: 'group',
            fields: [
                {
                    type: 'checkbox',
                    name: 'startupLabWhenFirstCheckIn',
                    label: "Turn on all devices when the first member checks into the lab"
                },
                {
                    type: 'checkbox',
                    name: 'shutdownLabWhenAllCheckedOut',
                    label: "Shutdown all devices when all members have been checked out of the lab"
                },
                {
                    type: 'checkbox',
                    name: 'notifyStatus',
                    label: "Send a notification when the XR Lab opens/closes"
                },
                {
                    type: 'checkbox',
                    name: 'notifyLeadershipCheckInOut',
                    label: "Send a notification when a leadership member enters/exits the XR Lab",
                    admin: {
                        description: "This notification is only sent while the XR Lab is open."
                    }
                },
                {
                    type: 'relationship',
                    name: 'rolesToAnnounce',
                    label: "Roles to Announce",
                    relationTo: CollectionSlugs.Roles,
                    hasMany: true,
                    admin: {
                        description: "A leadership check in/out notification will only be sent if the member has one of these roles."
                    }
                }
            ]
        }
    ]
};

export default Lab;