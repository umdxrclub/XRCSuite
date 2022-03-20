import { Client } from "discord.js";
import { scoresaberRoutine } from "./scoresaber";

export interface Routine {
    intervalMs: number,
    execute: (client: Client) => void,
}

export const BOT_ROUTINES: Routine[] = [
    scoresaberRoutine
];