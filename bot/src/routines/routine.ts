import { Client } from "discord.js";
export interface Routine {
    intervalMs: number,
    execute: (client: Client) => void,
}

export const BOT_ROUTINES: Routine[] = [

];