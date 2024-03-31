import { Client, GatewayIntentBits, Partials } from "discord.js";
import payload from "payload";
import BotInteractions from "./interactions/interactions";
import { rejectInteractionIfNotLeadership } from "./util";
import { BotCommands } from "./commands/Command";
import { setClient } from "@xrclub/club.js/dist/discord/bot";

const BOT_INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
];

// Create the bot client.
var discordClient: Client | undefined = undefined;

function onCreateClient(guildId: string, processDms: boolean) {
  if (discordClient) {
    discordClient.once("ready", async (client) => {
      console.log("Logged in as " + client.user.username);
      setClient(discordClient);
    });

    // Add slash command handlers
    discordClient.on("interactionCreate", async (interaction) => {
      // Make sure that the interaction comes from the configured guild.
      if (
        interaction.guildId !== guildId &&
        !(processDms && interaction.channel?.isDMBased())
      )
        return;

      BotInteractions.forEach((i) => i(interaction));

      BotCommands.forEach((c) => {
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
        if (
          command.leadershipOnly &&
          (await rejectInteractionIfNotLeadership(interaction))
        ) {
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
  if (discordConfig.enabled && discordConfig.guild?.guildId) {
    console.log("Starting Discord Bot...");
    let token = discordConfig.auth?.token;
    if (token) {
      discordClient = new Client({
        intents: BOT_INTENTS,
        partials: [Partials.Channel, Partials.Message, Partials.Reaction],
      });

      onCreateClient(discordConfig.guild.guildId, discordConfig.processDms);

      // Login to the Discord bot.
      try {
        await discordClient.login(token);
      } catch (error) {
        console.error("Error while logging into Discord: " + error);
      }
    } else {
      console.error("No config available!");
    }
  } else if (discordClient) {
    console.log("Disabling Discord Bot");
    discordClient.destroy();
    discordClient = undefined;
    setClient(undefined);
  }
}
