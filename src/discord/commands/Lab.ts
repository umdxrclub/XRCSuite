import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import payload from "payload";
import { GlobalSlugs } from "../../slugs";
import { rejectInteractionIfNotLeadership } from "../util";
import { Command } from "./Command";
import { Member } from "payload/generated-types";

async function onLabInvoke(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  let lab = await payload.findGlobal({
    slug: "lab",
    depth: 0,
  });

  switch (interaction.options.getSubcommand()) {
    case "open":
      if (!lab.open) {
        await payload.updateGlobal({
          slug: "lab",
          data: {
            ...lab,
            open: true,
          },
          depth: 0,
        });

        await interaction.reply({
          content: "The XR Lab is now open!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "The XR Lab is already open!",
          ephemeral: true,
        });
      }
      break;

    case "close":
      let checkOutEveryone =
        interaction.options.getBoolean("check-out-everyone");
      if (lab.open) {
        await payload.updateGlobal({
          slug: "lab",
          data: {
            ...lab,
            members: checkOutEveryone ? [] : lab.members,
            open: false,
          },
          depth: 0,
        });

        await interaction.reply({
          content: "The XR Lab is now closed!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "The XR Lab is already closed!",
          ephemeral: true,
        });
      }
      break;

    case "list":
      let fullLab = await payload.findGlobal({
        slug: "lab",
      });

      let members = fullLab.members as Member[];
      if (members && members.length > 0) {
        let list = members.map((m) => "\u2022 " + m.name).join("\n");
        await interaction.reply({
          content: "Current lab members:\n" + list,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There is no one in the lab right now!",
          ephemeral: true,
        });
      }
      break;
  }
}

export const LabCommand: Command = {
  onInvoke: onLabInvoke,
  leadershipOnly: true,
  data: new SlashCommandBuilder()
    .setName("lab")
    .setDescription("Manages the status of the XR Lab.")
    .addSubcommand((subcommand) =>
      subcommand.setName("open").setDescription("Opens the XR Lab.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("close")
        .setDescription("Closes the XR Lab.")
        .addBooleanOption((option) =>
          option
            .setName("check-out-everyone")
            .setDescription(
              "Whether to check out everyone still remaining in the lab."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("Lists the members within the XR Lab.")
    ),
};
