import {
  CacheType,
  Client,
  GatewayIntentBits,
  Interaction,
  Partials,
} from "discord.js";
import payload from "payload";
import { GlobalSlugs } from "../slugs";
import { BotCommands } from "./commands/command";

const BOT_INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent
];

// Create the bot client.
var discordClient: Client | undefined = undefined;

function onCreateClient(guildId: string) {
  if (discordClient) {
    discordClient.once("ready", async (client) => {
      console.log("Logged in as " + client.user.username);
    });

    // Add slash command handlers
    discordClient.on("interactionCreate", async (interaction) => {
      // Make sure that the interaction comes from the configured guild.
      if (interaction.guildId != guildId) return;

      // Only process commands.
      if (!interaction.isChatInputCommand()) return;

      // Find the associated command and execute its handler.
      const command = BotCommands.find(
        (cmd) => cmd.data.name === interaction.commandName
      );
      if (command) await command.onInvoke(interaction);
    });

    // Add interaction create handlers.
    discordClient.on("interactionCreate", (interaction) => {
      // Make sure that the interaction comes from the configured guild.
      if (interaction.guildId != guildId) return;

      BotCommands.forEach((c) => {
        if (c.onInteractionCreate) {
          c.onInteractionCreate(interaction);
        }
      });
    });

    discordClient.on("messageCreate", message => {
        if (message.guildId != guildId) return;
        console.log(message.content)
    })
  }
}

export function getDiscordClient(): Client | undefined {
  return discordClient;
}

export async function serveDiscordBot() {
  let discordConfig = await payload.findGlobal({ slug: GlobalSlugs.Discord });
  if (discordConfig.enabled) {
    console.log("Starting Discord Bot...");
    let token = discordConfig.auth.token;
    if (token) {
      discordClient = new Client({
        intents: BOT_INTENTS,
        partials: [Partials.Channel, Partials.Message, Partials.Reaction],
      });

      onCreateClient(discordConfig.guild.guildId);

      // Login to the Discord bot.
      await discordClient.login(token);
    } else {
      console.error("No config available!");
    }
  } else if (discordClient) {
    console.log("Disabling Discord Bot");
    discordClient.destroy();
    discordClient = undefined;
  }
}
