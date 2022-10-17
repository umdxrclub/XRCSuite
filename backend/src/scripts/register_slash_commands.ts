import { REST } from "@discordjs/rest";
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { BOT_COMMANDS } from "../discord/commands/command"
import XRC from "../data/XRC";

async function registerCommands() {
    // Get config
    let host = XRC.host;

    // Create the REST handler.
    const rest = new REST({ version: '9' }).setToken(host.discord.token);

    // Create the JSON body for each command.
    var command_data: RESTPostAPIApplicationCommandsJSONBody[] = [];
    BOT_COMMANDS.forEach((command) => {
        command_data.push(command.data.toJSON());
    });

    try {
        console.log("Attempting to register commands...");

        Object.keys(host.discord.guilds).forEach(async guildId => {
            await rest.put(
                Routes.applicationGuildCommands(host.discord.clientId, guildId),
                { body: command_data }
            )
        })

        console.log("Commands registered!");
    } catch (error) {
        console.error(error);
    }
}

registerCommands();