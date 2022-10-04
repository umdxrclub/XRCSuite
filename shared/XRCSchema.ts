export namespace XRCSchema {

    /**
     * Represents the different types of devices that the XR Club can own.
     */
    export enum DeviceType
    {
        Other,
        Laptop,
        Desktop,
        VRHeadset,
        ARHeadset,
    }

    /**
     * Represents a device owned by the club. Every device will have some
     * identifying serial number and a name.
     */
    export interface DeviceAttributes extends Identifiable {
        serial: string,
        name: string,
        deviceType: DeviceType
    }

    /**
     * Represents a club member. Each member has a unique id as well as other
     * contact information such as their email, university id, name, etc.
     */
    export interface MemberAttributes extends Identifiable {
        name?: string,
        email?: string,
        directoryId?: string,
        discordId?: string,
        terplinkAccountId?: string,
        terplinkIssuanceId?: string,
        scoresaberId?: string,
        steamId?: string,
        oculusId?: string,
        signedContract: boolean,
        wasSentContract: boolean,
        signedContractUrl?: string
    }

    /**
     * A day of the week.
     */
    enum Weekday
    {
        Sunday = 0,
        Monday = 1,
        Tuesday = 2,
        Wednesday = 3,
        Thursday = 4,
        Friday = 5,
        Saturday = 6
    }

    /**
     * Describes a time when the XR Lab is scheduled for opening.
     */
    export interface LabOpening {
        weekday: Weekday,
        openTime: string,
        closeTime: string,
        availableStaffNames: string[]
    }

    /**
     * Represents the status of the XR Club Lab. The lab is either open or closed.
     * When the lab is open, there should be one or more mentors/leadership staff
     * within the lab to provide assistance and maintain the lab until closing.
     */
    export interface LabStatus
    {
        open: boolean,
        availableStaffNames: string[],
        schedule: LabOpening[],
        totalCheckedIn: number
    }

    export interface Event extends Identifiable {
        name: string,
        terplinkEventId?: number | undefined
        terplinkEventCode?: string | undefined
        discordEventId?: string | undefined
        startDate?: string | undefined,
        endDate?: string | undefined
    }

    export enum AttendanceType {
        CheckIn = 0,
        CheckOut = 1
    }

    export interface Attendance extends Identifiable {
        memberId: number,
        eventId: number,
        date: Date,
        type: AttendanceType
    }

    /**
     * The different types of roles that exist within the XR Club.
     */
    export enum ClubRole
    {
        Member,
        Mentor,
        VicePresident,
        President
    }

    /**
     * A data type which has an ID number to identify it.
     */
    export interface Identifiable {
        id: number
    }

    export type EventsCheckInQueryParameters = {
        tlEventCode?: string,
        eventId?: string
    }

    export type EventsCheckInBody = Partial<MemberAttributes>

    export type CheckInResult = {
        name: string,
        isClubMember: boolean,
        type: "in" | "out"
    }

    export type Response = {
        success: boolean,
        error?: string,
        data: any | null
    }


}