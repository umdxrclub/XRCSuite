import { EmbedBuilder } from "@discordjs/builders";
import { TextChannel } from "discord.js";
import payload from "payload";
import { CollectionAfterChangeHook } from "payload/types";
import { getDiscordClient } from "../../discord/bot";
import { CollectionSlugs } from "../../slugs";

const AuditMessagesHook: CollectionAfterChangeHook = async (args) => {
  let client = getDiscordClient();

  if (client && args.operation === "create") {
    let guilds = await payload.find({
      collection: CollectionSlugs.Guilds,
    });

    guilds.docs.forEach(async (guildDoc) => {
      if (guildDoc.auditId) {
        let channel = await client.channels.fetch(guildDoc.auditId);
        if (channel && channel instanceof TextChannel) {
          let name = args.doc.member.name;
          let eventName = args.doc.event.name;
          let type = args.doc.type;
          let isCheckIn = type === "in";
          let date = new Date(args.doc.date);

          let embed = new EmbedBuilder();
          embed.setDescription(
            isCheckIn
              ? `**${name}** checked into the event \"${eventName}\"`
              : `**${name}** checked out of the event \"${eventName}\"`
          );
          embed.setColor(isCheckIn ? [133, 212, 49] : [212, 82, 49])
          embed.setTimestamp(date)

          await channel.send({ embeds: [embed] });
        }
      }
    });
  }
};

export default AuditMessagesHook;
