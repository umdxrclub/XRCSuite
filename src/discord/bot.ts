import {
    Client,
    GatewayIntentBits, Partials
} from "discord.js";
import payload from "payload";
import { GlobalSlugs } from "../slugs";
import { BotCommands } from "./commands/command";
import BotInteractions from "./interactions/interactions";
import { createAndUpdateStatusChannelManagers } from "./multi/multi";
import { rejectInteractionIfNotLeadership } from "./util";

const BOT_INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent,
];

// Create the bot client.
var discordClient: Client | undefined = undefined;

function onCreateClient(guildId: string) {
  if (discordClient) {
    discordClient.once("ready", async (client) => {
      console.log("Logged in as " + client.user.username);
      await createAndUpdateStatusChannelManagers();
    });

    // Add slash command handlers
    discordClient.on("interactionCreate", async (interaction) => {
      // Make sure that the interaction comes from the configured guild.
      if (interaction.guildId != guildId) return;

      BotInteractions.forEach(i => i(interaction))

      BotCommands.forEach(c => {
        if (c.onInteractionCreate) {
          c.onInteractionCreate(interaction);
        }
      });

      // Only process commands from this point forward.
      if (!interaction.isChatInputCommand()) return;

      // Find the associated command and execute its handler.
      const command = BotCommands.find(
        (cmd) => cmd.data.name === interaction.commandName
      );

      if (command) {
        // If the command requires leadership, ensure that they are leadership.
        if (command.leadershipOnly && await rejectInteractionIfNotLeadership(interaction)) {
            return;
        }

        // Run command
        await command.onInvoke(interaction);
      }
    });
  }
}

export function getDiscordClient(): Client | undefined {
  return discordClient;
}

export async function serveDiscordBot() {
  let discordConfig = await payload.findGlobal({ slug: "bot" });
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
      try {
        await discordClient.login(token);
      } catch (error) {
        console.error("Error while logging into Discord: " + error)
      }
    } else {
      console.error("No config available!");
    }
  } else if (discordClient) {
    console.log("Disabling Discord Bot");
    discordClient.destroy();
    discordClient = undefined;
  }
}
