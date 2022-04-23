export namespace XRCSchema {
    export enum DEVICE_TYPE {
        OTHER,
        VR_HEADSET,
        AR_HEADSET,
        SMARTPHONE,
        ACCESSORY,
    }

    export interface Device {
        serial: string,
        name: string,
        macAddress: string | null
    }

    export interface DeviceHeartbeat {
        serial: string,
        externalIp: string,
        heartbeat: Heartbeat
    }

    export interface NearbyNetwork {
        bssid: string,
        level: number
    }

    export interface Heartbeat {
        type: "boot" | "heartbeat",
        date: string,
        device: {
            battery: {
                percentage: number,
                charging: boolean
            },
            wifi: {
                ipAddr: string,
                ssid: string,
                bssid: string,
                strength: number,
                scan: NearbyNetwork[] | null
            },
            serial: string,
            uptime: string
        }
    }

    export interface Member {
        id: number,
        name: string | null,
        email: string | null,
        directory_id: string | null,
        discord_id: string | null,
        terplink_id: string | null,
        scoresaber_id: string | null,
        steam_id: string | null
        oculus_id: string | null
        signed_waiver: boolean
    }

    export interface ClubEvent {
        name: string,
        startDate: string,
        endDate: string,
        imageUrl?: string,
    }

    export interface AttendanceEvent {
        id: number,
        member_id: number,
        type: "checkin" | "checkout",
        location: string
    }
}