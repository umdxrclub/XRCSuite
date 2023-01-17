import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, ChatInputCommandInteraction, GuildMember } from "discord.js";
import payload from "payload";
import { XRClubDiscordRole, XRClubDiscordRoles } from "../../types/XRCTypes";
import { GlobalSlugs } from "../../slugs";
import { getGuild } from "../util";
import { Command } from "./command";
import { Bot } from "../../types/PayloadSchema";

async function resolveMemberAndRole(memberId: string, roleName: string, callback: (role: XRClubDiscordRole, roleId: string, member: GuildMember, hasRole: boolean) => void) {
  // Get the corresponding role id.
  let role = XRClubDiscordRoles.find(r => r.name == roleName);
  let doc = await payload.findGlobal<Bot>({
      slug: GlobalSlugs.Discord
  })
  let roleId = doc.guild.roles[roleName];

  // Add this role to the member if they don't already have it.
  if (roleId) {
      let guild = await getGuild();
      let guildMember = await guild.members.resolve(memberId);

      if (guildMember) {
          let hasRole = guildMember.roles.cache.has(roleId);
          callback(role, roleId, guildMember, hasRole)
      }
  }
}

async function onRolesInvoke(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  switch (interaction.options.getSubcommand()) {
    case "add":
        await resolveMemberAndRole(interaction.user.id, interaction.options.getString("role"), async (role, roleId, member, hasRole) => {
            if (!hasRole) {
                await member.roles.add(roleId)
                await interaction.reply({ content: `You have added the role ${role.title}!`, ephemeral: true })
            }
        })
        break;

    case "remove":
        await resolveMemberAndRole(interaction.user.id, interaction.options.getString("role"), async (role, roleId, member, hasRole) => {
            if (hasRole) {
                await member.roles.remove(roleId)
                await interaction.reply({ content: `You have removed the role ${role.title}!`, ephemeral: true })
            }
        })
        break;
  }
}

export const RolesCommand: Command = {
  onInvoke: onRolesInvoke,
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Allows you to add and remove roles.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Adds a specified role to your profile.")
        .addStringOption((option) =>
          option
            .setName("role")
            .setDescription("The role which you would like to add")
            .setChoices(...XRClubDiscordRoles.map(r => ({ name: r.title, value: r.name})))
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Removes a specified role from your profile.")
        .addStringOption((option) =>
          option
            .setName("role")
            .setDescription("The role which you would like to remove")
            .setChoices(...XRClubDiscordRoles.map(r => ({ name: r.title, value: r.name})))
            .setRequired(true)
        )
    ),
};
