import { REST } from "@discordjs/rest";
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { BOT_COMMANDS } from "../src/commands/command";
import { getDiscordConfig } from "../src/data";

async function registerCommands() {
    // Get config
    let config = await getDiscordConfig();

    // Create the REST handler.
    const rest = new REST({ version: '9' }).setToken(config.token);

    // Create the JSON body for each command.
    var command_data: RESTPostAPIApplicationCommandsJSONBody[] = [];
    BOT_COMMANDS.forEach((command) => {
        command_data.push(command.data.toJSON());
    });

    try {
        console.log("Attempting to register commands...");

        Object.keys(config.guilds).forEach(async guildId => {
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, guildId),
                { body: command_data }
            )
        })

        console.log("Commands registered!");
    } catch (error) {
        console.error(error);
    }
}

registerCommands();