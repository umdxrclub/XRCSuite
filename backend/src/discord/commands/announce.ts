import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "./command";

async function onAnnounceInvoke(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  switch (interaction.options.getSubcommand()) {
    case "event-reminder":
        // Retreive the Discord event mentioned in the argument.
        let eventId = interaction.options.getString("event-id")!;
        let guild = interaction.guild;
        let event = await guild!.scheduledEvents.fetch(eventId);

        if (event) {
            let eventName = event.name;
            await interaction.reply({
                content: "This event is called: " + event.name,
                ephemeral: true
            })
            let subscribers = await event.fetchSubscribers()

            // Remove an existing "Event Attendee"
            let currentRoles = await guild?.roles.fetch();
            if (currentRoles)
            {
                for (var pair of currentRoles)
                {
                    let role = pair[1];
                    if (role.name == "Event Attendee")
                    {
                        await guild?.roles.delete(role);
                        break;
                    }
                }
            }

            // Create role
            let role = await guild?.roles.create({
                name: "Event Attendee",
                mentionable: false,
            })

            if (role)
            {
                // Set no perms
                await role.setPermissions([]);

                // Add role to members
                await Promise.all(subscribers.map(async member => {
                    let guildMember = await guild?.members.fetch(member.user.id);
                    if (guildMember) {
                        await guildMember.roles.add(role!.id);
                    }
                }));

                // Send ping
                let msg = await interaction.channel?.send(`<@&${role.id}> we boutta meet!`);
            }

        } else {
            await interaction.reply("Could not find event!");
        }
        break;
  }
}

export const announce: Command = {
  onInvoke: onAnnounceInvoke,
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription(
      "Announces events and activities within the XR Club Discord."
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("event-reminder")
        .setDescription(
          "Announces a reminder to attendees of an upcoming Discord event."
        )
        .addStringOption((option) =>
          option
            .setName("event-id")
            .setDescription("The ID of the Discord event to remind attendees.")
            .setRequired(true)
        )
    ),
};
