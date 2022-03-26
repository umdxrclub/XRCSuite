export declare namespace XRCSchema {
    enum DEVICE_TYPE {
        OTHER = 0,
        VR_HEADSET = 1,
        AR_HEADSET = 2,
        SMARTPHONE = 3,
        ACCESSORY = 4
    }
    interface Device {
        serial: string;
        name: string;
        macAddress: string | null;
    }
    interface DeviceHeartbeat {
        serial: string;
        externalIp: string;
        heartbeat: Heartbeat;
    }
    interface Heartbeat {
        type: "boot" | "heartbeat";
        date: string;
        device: {
            battery: {
                percentage: number;
                charging: boolean;
            };
            wifi: {
                ipAddr: string;
                ssid: string;
                bssid: string;
                strength: number;
            };
            serial: string;
            uptime: string;
        };
    }
    interface Member {
        id: number;
        discord_id: string | null;
        uid: string | null;
        name: string | null;
        email: string | null;
        scoresaber_id: string | null;
        terplink_id: string | null;
    }
    interface ClubEvent {
        name: string;
        startDate: string;
        endDate: string;
        imageUrl?: string;
    }
}
