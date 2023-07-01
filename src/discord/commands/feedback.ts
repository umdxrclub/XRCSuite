import {
  ActionRowBuilder,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { Command } from "./Command";

const FeedbackTypes = [
  {
    type: "general",
    label: "General Feedback",
  },
  {
    type: "purchase",
    label: "Purchase Request",
  },
];
const FeedbackTypeCustomId = "feedback-type-select";

async function onFeedbackInvoke(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(FeedbackTypeCustomId)
      .setPlaceholder("No type selected")
      .addOptions(
        FeedbackTypes.map((ft) => ({
          label: ft.label,
          value: ft.type,
        }))
      )
  );
}

export const FeedbackCommand: Command = {
  onInvoke: onFeedbackInvoke,
  data: new SlashCommandBuilder()
    .setName("feedback")
    .setDescription(
      "Give us feedback on the XR Club and how we can do things better!"
    ),
};
