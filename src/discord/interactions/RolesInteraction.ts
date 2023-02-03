import payload from "payload";
import { CollectionSlugs } from "../../slugs";
import { Role } from "../../types/PayloadSchema";
import { getGuild } from "../util";
import { InteractionHandler } from "./interactions";

const RolesRegex = /Roles-(.*)/;

const RolesMessageInteractionHandler: InteractionHandler = async interaction => {
    if (interaction.isButton() && RolesRegex.test(interaction.customId)) {
        let match = RolesRegex.exec(interaction.customId);
        let roleId = match[1];

        var role: Role
        try {
            role = await payload.findByID<Role>({
                collection: CollectionSlugs.Roles,
                id: roleId
            })
        } catch {
            await interaction.reply({ content: "This role no longer exists!", ephemeral: true })
        }

        if (role.discordRoleId) {
            let guild = await getGuild();
            let discordRole = await guild.roles.fetch(role.discordRoleId)
            if (discordRole) {
                let member = await guild.members.fetch(interaction.user.id);
                let hasRole = member.roles.cache.has(role.discordRoleId);
                var message: string
                if (member.roles.cache.has(role.discordRoleId)) {
                    await member.roles.remove(discordRole.id)
                    message = "You have removed the role: " + role.name
                } else {
                    await member.roles.add(discordRole.id)
                    message = "You have added the role: " + role.name
                }

                await interaction.reply({ content: message, ephemeral: true })
                return;
            }

        }
        await interaction.reply({ content: "An internal error occurred while trying to apply this role. Please try again later.", ephemeral: true })
    }
}

export default RolesMessageInteractionHandler;