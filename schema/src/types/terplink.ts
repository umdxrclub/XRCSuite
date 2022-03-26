export namespace TerpLinkSchema {
    export interface Event {
        authUrl: string,
        communityName: string,
        organizationName: string,
        accessToken: string,
        countryCode: string,
        theme: string,
        name: string,
        startsOn: string,
        endsOn: string,
        id: number,
        imagePath: string,
        totalAllowed: number,
        accessCode: string,
        visibility: string,
        institutionId: number,
        regionCode: string
    }

    export interface Account {
        id: string,
        email: string | null,
        middleName: string,
        firstName: string,
        lastName: string,
        profileImagePath: string,
        name: string
    }


    export type AttendeeStatus = "Na" | "Attended"
    export type AttendeeLastLogAction = "CheckIn" | "CheckOut"

    export interface Attendee {
        id: number,
        email: number,
        status: AttendeeStatus,
        account: Account,
        lastLogAction: AttendeeLastLogAction,
        lastLogActionDateTime: string
    }

    export interface Member {
        account: Account,
        lastLogAction: string | null,
        lastLogActionDateTime: string | null,
        attendanceId: number | null,
        status: string | null
    }
}

