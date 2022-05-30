import { REST } from "@discordjs/rest";
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { token, client_id } from "../credentials/tokens.json"
import { djs_bots } from "../credentials/guilds.json";
import { BOT_COMMANDS } from "./commands/command";

// Create the REST handler.
const rest = new REST({ version: '9' }).setToken(token);

// Create the JSON body for each command.
var command_data: RESTPostAPIApplicationCommandsJSONBody[] = [];
BOT_COMMANDS.forEach((command) => {
    command_data.push(command.data.toJSON());
});

async function registerCommands() {
    try {
        console.log("Attempting to register commands...");

        await rest.put(
            Routes.applicationGuildCommands(client_id, djs_bots),
            { body: command_data }
        )

        console.log("Commands registered!");
    } catch (error) {
        console.error(error);
    }
}

registerCommands();