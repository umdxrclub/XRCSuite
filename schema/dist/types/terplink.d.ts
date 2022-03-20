export declare namespace TerpLinkSchema {
    interface Event {
        authUrl: string;
        communityName: string;
        organizationName: string;
        accessToken: string;
        countryCode: string;
        theme: string;
        name: string;
        startsOn: string;
        endsOn: string;
        id: number;
        imagePath: string;
        totalAllowed: number;
        accessCode: string;
        visibility: string;
        institutionId: number;
        regionCode: string;
    }
    interface Account {
        id: string;
        email: string | null;
        middleName: string;
        firstName: string;
        lastName: string;
        profileImagePath: string;
        name: string;
    }
    type AttendeeStatus = "Na" | "Attended";
    type AttendeeLastLogAction = "CheckIn" | "CheckOut";
    interface Attendee {
        id: number;
        email: number;
        status: AttendeeStatus;
        account: Account;
        lastLogAction: AttendeeLastLogAction;
        lastLogActionDateTime: string;
    }
    interface Member {
        account: Account;
        lastLogAction: string | null;
        lastLogActionDateTime: string | null;
        attendanceId: number | null;
        status: string | null;
    }
}
