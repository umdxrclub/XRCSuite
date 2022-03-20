import { Client } from "discord.js";
import { Routine } from "./routine";

export const scoresaberRoutine: Routine = {
    intervalMs: 5*60*1000,
    execute: (client: Client) => {
        console.log("Hello there!");
    }
}