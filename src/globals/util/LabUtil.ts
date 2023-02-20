import { EmbedBuilder } from "@discordjs/builders";
import {
  ActionRow,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import payload from "payload";
import Embed from "../../blocks/messages/Embed";
import { sendDiscordMessages } from "../../collections/util/MessageUtil";
import {
    createAttachmentFromImageData,
  createAttachmentFromMedia,
  createButton,
  DiscordMessage,
} from "../../discord/util";
import { Lab, Media, Schedule } from "../../types/PayloadSchema";
import { createImageBanner } from "../../util/image";
import { resolveDocument, resolveDocuments } from "../../util/payload-backend";

let LabGoogleMapsURL = "https://goo.gl/maps/y9SHsm25SB874n6H8";

export async function updateLabStatusMessage() {
  let lab = await payload.findGlobal({ slug: "lab" });
  // Update status message
  if (lab.discord.labMessage) {
    let labStatusMsg = await createLabStatusEmbedMessages();
    await sendDiscordMessages(lab.discord.labMessage, labStatusMsg);
  }
}

export async function updateLabControlMessage() {
  let lab = await payload.findGlobal({ slug: "lab" });
  // Update status message
  if (lab.discord.labControlMessage) {
    let labControlMessage = await createLabControlMessages();
    await sendDiscordMessages(lab.discord.labControlMessage, labControlMessage);
  }
}

export async function createLabControlMessages(): Promise<DiscordMessage[]> {
  let lab = await payload.findGlobal({ slug: "lab" });
  let messages: DiscordMessage[] = [];
  let buttons = new ActionRowBuilder<ButtonBuilder>();

  let embed = new EmbedBuilder();
  let numberOfMembers = lab.members?.length ?? 0;
  embed.setTitle("Current Members");
  embed.addFields({ name: "Member Count", value: numberOfMembers.toString() });
  embed.setColor(lab.open ? [133, 212, 49] : [212, 71, 49]);

  if (lab.open) {
    buttons.addComponents(
      createButton({
        style: ButtonStyle.Danger,
        label: "Close XR Lab",
        emoji: "😠",
        customId: "Lab-Close",
      })
    );
  } else {
    buttons.addComponents(
      createButton({
        style: ButtonStyle.Success,
        label: "Open XR Lab",
        emoji: "😊",
        customId: "Lab-Open",
      })
    );
  }

  let members = await resolveDocuments(lab.members ?? [], "members");
  if (members.length > 0) {
    let membersString = members.map((m) => m.name).join("\n");
    embed.setDescription(membersString);

    buttons.addComponents(
      createButton({
        style: ButtonStyle.Danger,
        label: "Check Out All Members",
        emoji: "😭",
        customId: "Lab-CheckOutAll",
      })
    );
  }

  messages.push({ embeds: [embed], components: [buttons] });

  return messages;
}

export async function createLabStatusEmbedMessages(): Promise<
  DiscordMessage[]
> {
  let lab = await payload.findGlobal({ slug: "lab" });
  let embed = new EmbedBuilder();

  let messages: DiscordMessage[] = [];

  // Add schedules
  if (lab.schedule) {
    let schedule = await resolveDocument(lab.schedule, "schedules");

    let days: (keyof Schedule["schedule"])[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    for (var day of days) {
        let agenda = schedule.schedule[day]
        if (agenda && agenda.length > 0) {
            let dayString = day.charAt(0).toUpperCase() + day.substring(1);
            let imgBanner = await createImageBanner(dayString)
            let attachment = createAttachmentFromImageData(imgBanner).attachment
            messages.push({ files: [attachment]})

            let embedPromises = agenda.map(async block => {
                let blockEmbed = new EmbedBuilder();

                let time = block.time;
                if (time.allDay) {
                    blockEmbed.setDescription("**All Day**")
                } else {
                    blockEmbed.addFields([
                        {
                            name: "Time",
                            value: time.from,
                            inline: true
                        },
                        {
                            name: "To",
                            value: time.to,
                            inline: true
                        }
                    ])
                }

                switch (block.blockType) {
                    case "opening":
                        blockEmbed.setColor([133, 212, 49])
                        let staff = await resolveDocuments(block.staff, "members");
                        blockEmbed.addFields({
                            name: "Staff",
                            inline: true,
                            value: staff.map(s => s.nickname ?? s.name).join(", ")
                        })

                        break;

                    case "closing":
                        blockEmbed.setTitle("Lab Closed")
                        blockEmbed.setColor([212, 71, 49])
                        break;
                }

                if (block.note && block.note.length > 0) {
                    blockEmbed.addFields({
                        name: "Note",
                        value: block.note
                    })
                }

                return blockEmbed;
            })

            let scheduleEmbeds = await Promise.all(embedPromises)
            messages.push({ embeds: scheduleEmbeds })
        }
    }
  }

  if (lab.open) {
    embed.addFields({
      name: "Member Count",
      value: (lab.members?.length ?? 0).toString(),
    });
  }

  // Determine whether an image banner can be added
  var bannerMedia: Media | string | undefined = undefined;
  if (lab.open && lab.media.labOpenImage) {
    bannerMedia = lab.media.labOpenImage;
  } else if (!lab.open && lab.media.labClosedImage) {
    bannerMedia = lab.media.labClosedImage;
  } else {
    embed.setTitle("XR Lab Status");
    embed.setDescription(
      lab.open ? "The XR Lab is open!" : "The XR Lab is closed."
    );
  }

  // Resolve and add the image banner
  var bannerAttachment: AttachmentBuilder | undefined = undefined;
  if (bannerMedia) {
    let attachment = await createAttachmentFromMedia(bannerMedia);
    bannerAttachment = attachment.attachment;
    embed.setImage(attachment.url);
  }

  embed.setFooter({ text: "AVW 4176" });
  embed.setColor(lab.open ? [133, 212, 49] : [212, 82, 49]);
  embed.setTimestamp(new Date());

  let row = new ActionRowBuilder<ButtonBuilder>();

  // Add "notify me" button
  if (lab.discord.labNotificationsRole) {
    let role = await resolveDocument(lab.discord.labNotificationsRole, "roles");
    if (role.discordRoleId) {
      row.addComponents(
        createButton({
          emoji: "🔔",
          label: "Notify Me",
          style: ButtonStyle.Success,
          customId: `Roles-${role.id}`,
        })
      );
    }
  }

  // Add Google Maps button
  row.addComponents(
    new ButtonBuilder()
      .setURL(LabGoogleMapsURL)
      .setStyle(ButtonStyle.Link)
      .setEmoji("📍")
      .setLabel("View on Google Maps")
  );

  // Create "Lab Status" banner
  let labStatusBannerImg = await createImageBanner("Lab Status")
  let labStatusAttachment = createAttachmentFromImageData(labStatusBannerImg).attachment
  messages.push({ files: [ labStatusAttachment ]})

  // Add Lab status embed
  let labStausMsg: DiscordMessage = {
    embeds: [embed],
    files: bannerAttachment ? [bannerAttachment] : [],
    components: [row],
  };
  messages.push(labStausMsg);

  return messages;
}
