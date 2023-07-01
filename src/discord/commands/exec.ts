import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import RoutineMap from "../../server/routines";
import { Command } from "./Command";

async function onExecInvoke(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  let routineName = interaction.options.getString("name")!;
  let routine = RoutineMap.get(routineName);
  if (routine) {
    // Invoke routine
    routine();

    await interaction.reply({ content: "Done!", ephemeral: true });
  } else {
    await interaction.reply({
      content: "No routine was found with that name!",
      ephemeral: true,
    });
  }
}

export const ExecCommand: Command = {
  onInvoke: onExecInvoke,
  leadershipOnly: true,
  data: new SlashCommandBuilder()
    .setName("exec")
    .setDescription("Developer command to execute routines.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The routine to execute")
        .setRequired(true)
    ),
};
