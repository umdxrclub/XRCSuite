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
            },
            serial: string,
            uptime: string
        }
    }

    export interface Member {
        id: number,
        discord_id: string | null,
        uid: string | null,
        name: string | null,
        email: string | null,
        scoresaber_id: string | null,
        terplink_id: string | null,
    }

    export interface ClubEvent {
        name: string,
        startDate: string,
        endDate: string,
        imageUrl?: string,
    }
}