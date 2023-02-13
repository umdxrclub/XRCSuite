import { EmbedBuilder } from "@discordjs/builders";
import { AttachmentBuilder } from "discord.js";
import payload from "payload";
import { GlobalAfterChangeHook } from "payload/types";
import { getStatusChannelManager } from "../../discord/multi/multi";
import MultiMessageManager from "../../discord/multi/MultiMessageManager";
import { createAttachmentFromMedia, getGuildChannel, sendGuildMessage } from "../../discord/util";
import { createLabStatusEmbedMessage, updateLabStatusMessage } from "../../globals/util/LabUtil";
import { getDocumentId } from "../../payload";
import { CollectionSlugs, GlobalSlugs } from "../../slugs";
import { Bot, Lab, Media, Member } from "../../types/PayloadSchema";
import { resolveDocument } from "../../util/payload-backend";

async function getLabNotificationDiscordRoleId(): Promise<string | null> {
  let discordDoc = await payload.findGlobal({ slug: "bot" })
    if (discordDoc.guild.notificationRoles.lab) {
      let labNotificationRole = await resolveDocument(discordDoc.guild.notificationRoles.lab, "roles");
      return labNotificationRole.discordRoleId ?? null;
    }

    return null;
}
function createLabNotificationEmbed(): EmbedBuilder {
  let embed = new EmbedBuilder();

  embed.setTitle("XR Lab");
  embed.setFooter({ text: "AVW 4176" });
  embed.setTimestamp(new Date());

  return embed;
}

const LabStatusHook: GlobalAfterChangeHook = async (args) => {
  // Check if the lab status has changed.
  let doc = args.doc as Lab;
  let prevDoc = args.previousDoc as Lab;
  let notificationRoleId = await getLabNotificationDiscordRoleId();
  var shouldNotify = false

  updateLabStatusMessage();

  let embeds = []
  let files = []

  // Determine the members who have checked in/out.
  let prevMembers = prevDoc.members?.map(getDocumentId) ?? [];
  let currentMembers = doc.members?.map(getDocumentId) ?? [];
  let newMemberIds = currentMembers.filter((id) => !prevMembers.includes(id));
  let removedMemberIds = prevMembers.filter(
    (id) => !currentMembers.includes(id)
  );
  let announceRoles = doc.settings.rolesToAnnounce?.map(getDocumentId) ?? [];

  // Create an array of all changed members with their id and a checked in/out flag.
  var changedMemberIds: { id: string, type: "in" | "out" }[] = newMemberIds.map(id => ({ id, type: "in" }))
  changedMemberIds = changedMemberIds.concat(removedMemberIds.map(id => ({ id, type: "out" })));

  // Create attendance events.
  changedMemberIds.forEach(async ({id, type}) => {
    await payload.create({
      collection: "attendances",
      data: {
        member: id,
        date: (new Date()).toString(),
        event: args.doc.event,
        type: type
      },
    });
  });

  // Determine whether lab status changed.
  if (doc.open != prevDoc.open) {
    let open = doc.open;
    shouldNotify ||= open;

    let statusChangeEmbed = createLabNotificationEmbed();
    statusChangeEmbed.setDescription(open ? "The XR Lab is now open!" : "The XR Lab is now closed.")
    statusChangeEmbed.setColor(open ? [133, 212, 49] : [212,71,49])
    embeds.push(statusChangeEmbed)
  }

  // Process the newly checked-in members.
  if (newMemberIds.length > 0) {
    let newMembers = await Promise.all(
      newMemberIds.map(
        async (id) =>
          await payload.findByID({
            collection: "members",
            id: id,
          })
      )
    );

    let membersToAnnounce = newMembers.filter((m) =>
      (m.roles ?? []).some((r) => announceRoles.includes(getDocumentId(r)))
    );

    
    membersToAnnounce.forEach(async (m) => {
      // Send Discord notification.
      let embed = createLabNotificationEmbed();
      let name = m.nickname ?? m.name;
      embed.setDescription(`${name} has checked into the XR Lab!`);
      embed.setColor([133, 212, 49]);

      var profileFile : AttachmentBuilder | undefined
      if (m.profile.picture) {
        let profileAttachment = await createAttachmentFromMedia(m.profile.picture);
        profileFile = profileAttachment.attachment
        embed.setThumbnail(profileAttachment.url)
        files.push(profileFile)
      }

      embeds.push(embed)
    });
  }

  // If there is a role to ping, add it.
  var notificationMessageContent: string | undefined = undefined
  if (shouldNotify && notificationRoleId) {
    notificationMessageContent = `<@&${notificationRoleId}>`
  }

  await sendGuildMessage("notifications", { content: notificationMessageContent, embeds: embeds, files: files });
};

export default LabStatusHook;
