import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction
} from "discord.js";
import payload from "payload";
import { getMemberFromDiscordId } from "../../collections/util/MembersUtil";
import XRC from "../../server/XRC";
import { Command } from "./command";

async function onLinkInvoke(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  // First check if they are already a registered member.
  let member = await getMemberFromDiscordId(interaction.user.id);

  switch (interaction.options.getSubcommand()) {
    case "umd":
      if (member) {
        await interaction.reply({
          content:
            "You have already linked your UMD profile! If you believe that this is an error, please contact the XR Club leadership.",
          ephemeral: true,
        });
        return;
      }

      let url = await XRC.umd.createAuthenticationUrl(interaction.user.id);

      // Send verification information.
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Verify you're a UMD student")
          .setStyle(ButtonStyle.Link)
          .setURL(url)
      );
      await interaction.reply({
        content: "Click the following button to verify your UID",
        components: [row as any],
        ephemeral: true,
      });

      // Await verification.
      let { directoryId, foundMember } = await XRC.umd.waitForVerify(
        interaction.user.id
      );

      // Send successful verification.
      await interaction.followUp({
        content: `You are ${directoryId}, updated: ${foundMember}`,
        ephemeral: true,
      });
      break;

    case "swipecard":
      if (member) {
        let serial = interaction.options.getString("serial");
        const re = /[0-9]{14}/;
        let isValidSerial = re.test(serial)

        if (isValidSerial) {
          await payload.update({
            collection: "members",
            id: member.id,
            data: {
              umd: {
                cardSerial: serial
              }
            } as any
          })

          await interaction.reply({ content: "Your swipe card has been successfully registered. You can now use it for check-in at the XR Lab and our events!", ephemeral: true });
        } else {
          await interaction.reply({ content: "This is not a valid serial number, please try again!", ephemeral: true })
        }
      } else {
        await interaction.reply({ content: "Oh no! You cannot add a swipe card because your Discord account isn't tied to your UMD profile. To do so, use /link umd.", ephemeral: true })
      }
      break;
    }
}

export const LinkCommand: Command = {
  onInvoke: onLinkInvoke,
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription(
      "Manages the association of third-party services/accounts to your Discord account"
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("umd")
        .setDescription(
          "Allows you to connect your UMD id to your Discord account."
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("swipecard")
        .setDescription(
          "Allows you to input your UMD swipecard barcode number for check in at the XR Lab."
        )
        .addStringOption((option) =>
          option
            .setName("serial")
            .setDescription("The numbers above your swipecard's barcode. You do not need to add spaces.")
            .setRequired(true)
        )
    ),
};
