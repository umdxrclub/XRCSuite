import { NewsChannel, TextChannel } from "discord.js";
import { CollectionAfterChangeHook } from "payload/types";
import { createPollEmbedAndRow } from "../../collections/util/PollUtil";
import { getDiscordClient } from "../../discord/bot";
import { Throttle } from "../../util/throttle";
import { Poll } from "payload/generated-types";

const pollUpdateThrottle = new Throttle(5000);

const UpdatedPollMessageHook: CollectionAfterChangeHook = async (args) => {
  let doc = args.doc as Poll;
  let client = getDiscordClient();
  if (!client) return;

  // Create the embed/row
  let pollEmbed = await createPollEmbedAndRow(doc);
  if (!pollEmbed) return;
  let { embed, row } = pollEmbed;

  let messages = doc.messages ?? [];
  messages.forEach(async (msg) => {
    let channelId = msg.channel;
    let messageId = msg.msg;

    // Get the channel of the message.
    let channel = await client!.channels.cache.get(channelId)?.fetch();
    if (
      !channel ||
      !(channel instanceof TextChannel || channel instanceof NewsChannel)
    )
      return;

    // Get the message
    let message = await channel.messages.fetch(messageId);
    if (!message) return;

    // Update the message using the throttle.
    pollUpdateThrottle.exec(() => {
      message.edit({
        content: "",
        embeds: [embed],
        components: row ? [row] : [],
      });
    });
  });
};

export default UpdatedPollMessageHook;
