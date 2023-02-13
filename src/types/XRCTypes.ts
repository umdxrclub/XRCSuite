import { Option } from "payload/dist/fields/config/types"
import { Bot, Message } from "./PayloadSchema"

export type XRCSuiteChannelType = keyof Bot["guild"]["channels"]
export type DiscordMessageBlockArray = Message["content"]

export type XRClubDiscordRole = {
    name: string,
    title: string
}

export type ResolveMethod = "id" | "terplink" | "card"
export type LabMediaType = "accept-sound" | "reject-sound" | "tv"

export type DiscordMemberInfo = {
    name: string,
    avatarUrl: string,
    inGuild: boolean
}

export type DiscordGuildStats = {
    count: number,
    iconUrl: string,
    name: string,
    channels: {
        name: string,
        id: string,
        type: number
    }[],
    emojis: {
        id: string,
        animated: boolean,
        name: string,
        url: string
    }[],
    roles: {
        id: string,
        name: string,
        priority: number,
        color: string
    }[]
}

export const XRClubDiscordNotificationRoles: XRClubDiscordRole[] = [
    {
        name: "lab",
        title: "Lab Notifications"
    },
    {
        name: "workshop",
        title: "Workshop Notifications"
    },
    {
        name: "project",
        title: "Project Notifications"
    }
]

export const XRClubEventTypes: string[] = [
    "Workshop",
    "Interest Meeting",
    "Speaker Event",
    "Game Night",
    "Tournament",
    "Field Trip",
    "Other"
]

/**
 * The different statuses that a device can be in.
 */
export const DeviceStatus: Option[] = [
    {
        label: "In Lab",
        value: "inLab"
    },
    {
        label: "Checked Out",
        value: "checkedOut"
    }
]

export const HardwareDescriptionPrefix = "h_";
export const SoftwareDescriptionPrefix = "s_";

/**
 * The different types of things that can be described. Values beginning with "h_"
 * indicate a type of hardware, whereas values beginning with "s_" indicate a type
 * of software.
 */
export const DescriptionType: Option[] = [
    {
        label: "VR Headset",
        value: HardwareDescriptionPrefix + "vr"
    },
    {
        label: "AR Headset",
        value: HardwareDescriptionPrefix + "ar",
    },
    {
        label: "XR Headset",
        value: HardwareDescriptionPrefix + "xr"
    },
    {
        label: "VR Accessory",
        value: HardwareDescriptionPrefix + "vr_accessory"
    },
    {
        label: "Desktop",
        value: HardwareDescriptionPrefix + "pc"
    },
    {
        label: "Laptop",
        value: HardwareDescriptionPrefix + "laptop"
    },
    {
        label: "Game Console",
        value: HardwareDescriptionPrefix + "console"
    },
    {
        label: "Phone",
        value: HardwareDescriptionPrefix + "phone"
    },
    {
        label: "Misc. Hardware",
        value: HardwareDescriptionPrefix + "misc"
    },
    {
        label: "Game",
        value: SoftwareDescriptionPrefix + "game"
    },
    {
        label: "Software",
        value: SoftwareDescriptionPrefix + "software"
    }
]

export const ChannelType = [
    {
        label: "Announcements",
        value: "announcements"
    },
    {
        label: "Lab Status",
        value: "lab"
    },
    {
        label: "Notifications",
        value: "notifications"
    },
    {
        label: "Lab Inventory",
        value: "inventory"
    },
    {
        label: "Audit",
        value: "audit"
    },
    {
        label: "Events",
        value: "events"
    },
    {
        label: "Leadership",
        value: "leadership"
    },
]

export const StatusChannelType = [
    {
        label: "Lab Status",
        value: "lab"
    },
    {
        label: "Lab Inventory",
        value: "inventory"
    },
    {
        label: "Leadership",
        value: "leadership"
    },
    {
        label: "Get Started",
        value: "getStarted"
    }
]

export type MemberProfile = {
    name: string,
    nickname?: string,
    leadershipRoles?: string[],
    profilePictureUrl?: string,
    bio: string,
    links: {
        type: string,
        url: string
    }[]
}