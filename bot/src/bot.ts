import { Client, Intents } from "discord.js";
import { BOT_COMMANDS } from "./commands/command";
import { BOT_ROUTINES } from "./routines/routine";
import * as fs from "fs/promises";
import { XRCBotService } from "./service";

const BOT_SERVICES: XRCBotService[] = [
    
];

// Create the bot client.
const client = new Client({ intents: [ Intents.FLAGS.GUILDS ]});

client.once('ready', async (client) => {
    console.log("Logged in as " + client.user.username);

    // // Get guilds to work on
    // var guilds = await fs.readFile("./credentials/guilds.json", "utf-8");
    // var guildsObj: Record<string, string> = JSON.parse(guilds);

    // Start bot routines
    BOT_ROUTINES.forEach(routine => {
        setInterval(() => routine.execute(client), routine.intervalMs);
    });
});

// Add slash command handlers
client.on("interactionCreate", async interaction => {
    // Only process commands.
    if (!interaction.isCommand())
        return;

    // Find the associated command and execute its handler.
    const command = BOT_COMMANDS.find((cmd) => cmd.data.name === interaction.commandName);
    if (command)
        await command.onInvoke(interaction);
});

async function startBot() {
    var tokens = await fs.readFile("./credentials/tokens.json", "utf8");
    var tokenObj = JSON.parse(tokens);
    const token: string | undefined = tokenObj.token;
    if (token) {
        console.log("Starting bot services...");
        // Start all bot services.
        let servicePromises = BOT_SERVICES.map(service => service.init());
        for (var i = 0; i < servicePromises.length; i++)
            await servicePromises[i];

        console.log("Services ready!");

        // Login to the Discord bot.
        await client.login(token);
    } else {
        console.error("No token provided!");
    }
}

startBot();


