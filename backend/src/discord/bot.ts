import { Client, GatewayIntentBits, Partials } from "discord.js";
import { getXRCHost } from "../util/host";
import { BOT_COMMANDS } from "./commands/command";

const BOT_INTENTS = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
]

// Create the bot client.
const client = new Client({
    intents: BOT_INTENTS,
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

client.once('ready', async (client) => {
    console.log("Logged in as " + client.user.username);
});

// Add slash command handlers
client.on("interactionCreate", async interaction => {
    // Only process commands.
    if (!interaction.isChatInputCommand())
        return;

    // Find the associated command and execute its handler.
    const command = BOT_COMMANDS.find((cmd) => cmd.data.name === interaction.commandName);
    if (command)
        await command.onInvoke(interaction);
});

// client.on("messageReactionAdd", async (reaction, user) => {
//     await onReactionAdd(reaction, user);
// })

export async function startDiscordBot() {
    let config = getXRCHost().discord;

    if (config) {
        // Login to the Discord bot.
        await client.login(config.token);
    } else {
        console.error("No config available!");
    }
}
