import { Client } from "discord.js";
import fs from "fs";

const roles_data = fs.readFileSync("./headsets.json", "utf-8");
export const HEADSET_ROLES = JSON.parse(roles_data) as HeadsetRoles;

interface HeadsetRoles {
    vendors: HeadsetVendor[]
}

interface HeadsetVendor {
    name: string,
    color?: string,
    headsets: Headset[]
}

interface Headset {
    name: string,
    discontinued?: boolean
}

export async function createHeadsetRoles(client: Client, guild_id: string) {
    const guild = client.guilds.cache.get(guild_id);
    if (guild) {
        HEADSET_ROLES.vendors.forEach((vendor) => {
            vendor.headsets.forEach(async (headset) => {
                const roleName = `${vendor.name} ${headset.name}`;
                console.log(roleName);
                await guild.roles.create({
                    name: roleName
                });
            });
        });
    }
}