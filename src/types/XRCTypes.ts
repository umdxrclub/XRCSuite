import { Option } from "payload/dist/fields/config/types"

export type AnnouncementChannelType = "announcements" | "audit" | "notifications" | "events"

export type XRClubDiscordRole = {
    name: string,
    title: string
}

export const XRClubDiscordRoles: XRClubDiscordRole[] = [
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
        label: "Requested",
        value: "requested"
    },
    {
        label: "Denied Funding",
        value: "denied"
    },
    {
        label: "Pending",
        value: "pending"
    },
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
        label: "Desktop",
        value: HardwareDescriptionPrefix + "pc"
    },
    {
        label: "Laptop",
        value: HardwareDescriptionPrefix + "laptop"
    },
    {
        label: "Phone",
        value: HardwareDescriptionPrefix + "phone"
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