import { EmbedBuilder } from "discord.js";
import { Trello } from "../../server/trello";

export async function makeCardEmbed(card: Trello.Card): Promise<EmbedBuilder> {
  let embed = new EmbedBuilder();

  embed.setTitle(card.getName());

  let description = card.getDescription();
  if (description.length > 0) embed.setDescription(card.getDescription());

  let checklists = await card.getChecklists();
  checklists.forEach((c) => {
    embed.addFields({
      name: c.getName(),
      value: c
        .getItems()
        .map((i) => `- ${i.name}`)
        .join("\n"),
      inline: false,
    });
  });

  let dueDate = card.getDueDate();
  if (dueDate) {
    let time = Math.round(dueDate.getTime() / 1000);
    embed.addFields({
      name: "Deadline",
      value: `<t:${time}:F> (<t:${time}:R>)`,
    });
  }

  return embed;
}
