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

export type MemberProfile = {
    name: string,
    nickname?: string,
    leadershipRoles?: string[],
    profilePictureUrl: string,
    bio: string[],
    links: {
        type: string,
        url: string
    }[]
}