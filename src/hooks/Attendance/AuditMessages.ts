import { EmbedBuilder } from "@discordjs/builders";
import payload from "payload";
import { CollectionAfterChangeHook } from "payload/types";
import { getDiscordClient } from "../../discord/bot";
import { sendGuildMessage } from "../../discord/util";
import { CollectionSlugs } from "../../slugs";

const AuditMessagesHook: CollectionAfterChangeHook = async (args) => {
  let client = getDiscordClient();

  if (client && args.operation === "create") {
    var { member, event } = args.doc;
    
    // Resolve member if its just a string.
    if (typeof member === "string") {
      member = await payload.findByID({
        collection: "members",
        id: member,
      });
    }

    // Resolve event if its just a string.
    if (typeof event === "string") {
      event = await payload.findByID({
        collection: "events",
        id: event,
      });
    }

    let name = member.name;
    let eventName = event.name;
    let type = args.doc.type;
    let isCheckIn = type === "in";
    let date = new Date(args.doc.date);

    let embed = new EmbedBuilder();
    embed.setDescription(
      isCheckIn
        ? `**${name}** checked into the event \"${eventName}\"`
        : `**${name}** checked out of the event \"${eventName}\"`
    );
    embed.setColor(isCheckIn ? [133, 212, 49] : [212, 82, 49]);
    embed.setTimestamp(date);

    await sendGuildMessage("audit", { embeds: [embed] });
  }
};

export default AuditMessagesHook;
