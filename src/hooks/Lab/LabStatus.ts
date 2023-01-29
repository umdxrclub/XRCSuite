import { EmbedBuilder } from "@discordjs/builders";
import { AttachmentBuilder } from "discord.js";
import payload from "payload";
import { GlobalAfterChangeHook } from "payload/types";
import { createAttachmentFromMedia, sendGuildMessage } from "../../discord/util";
import { CollectionSlugs } from "../../slugs";
import { Lab, Media, Member } from "../../types/PayloadSchema";

const LabStatusHook: GlobalAfterChangeHook = async (args) => {
  // Check if the lab status has changed.
  let doc = args.doc as Lab;
  let prevDoc = args.previousDoc as Lab;

  let notifyStatus = doc.settings.notifyStatus;
  let openStatusChanged = prevDoc.open != doc.open;
  if (openStatusChanged && notifyStatus) {
    let labOpen = doc.open;

    // Send Discord notification.
    let embed = new EmbedBuilder();

    // Determine whether an image banner can be added
    var bannerMedia: Media | string | undefined = undefined
    if (labOpen && doc.settings.labOpenImage) {
      bannerMedia = doc.settings.labOpenImage
    } else if (!labOpen && doc.settings.labClosedImage) {
      bannerMedia = doc.settings.labClosedImage
    }

    // Resolve and add the image banner
    var bannerAttachment: AttachmentBuilder | undefined = undefined
    if (bannerMedia) {
      let attachment = await createAttachmentFromMedia(bannerMedia);
      bannerAttachment = attachment.attachment;
      embed.setImage(attachment.url)
    }

    embed.setTitle("XR Lab Status");
    embed.setFooter({ text: "AVW 4176" });
    embed.setDescription(
      labOpen ? "The XR Lab is now open!" : "The XR Lab is now closed."
    );
    embed.setColor(labOpen ? [133, 212, 49] : [212, 82, 49]);
    embed.setTimestamp(new Date());

    await sendGuildMessage("lab", { embeds: [embed], files: bannerAttachment ? [bannerAttachment] : [] });
  }

  // Determine the members who have checked in/out.
  let prevMembers = args.previousDoc.members as string[];
  let currentMembers = args.doc.members as string[];
  let newMemberIds = currentMembers.filter((id) => !prevMembers.includes(id));
  let removedMemberIds = prevMembers.filter(
    (id) => !currentMembers.includes(id)
  );
  let announceRoles = args.doc.settings.leadershipRolesToNotify;

  // Create an array of all changed members with their id and a checked in/out flag.
  var changedMemberIds: { id: string, type: "in" | "out" }[] = newMemberIds.map(id => ({ id, type: "in" }))
  changedMemberIds = changedMemberIds.concat(removedMemberIds.map(id => ({ id, type: "out" })));

  // Create attendance events.
  changedMemberIds.forEach(async ({id, type}) => {
    await payload.create({
      collection: CollectionSlugs.Attendances,
      data: {
        member: id,
        date: new Date(),
        event: args.doc.event,
        type: type
      },
    });
  });

  // Process the newly checked-in members.
  if (newMemberIds.length > 0) {
    let newMembers = await Promise.all(
      newMemberIds.map(
        async (id) =>
          await payload.findByID<Member>({
            collection: CollectionSlugs.Members,
            id: id,
          })
      )
    );

    let leadershipMembers = newMembers.filter((m) =>
      (m.leadershipRoles ?? []).some((r) => announceRoles.includes(r))
    );
    leadershipMembers.forEach(async (m) => {
      // Send Discord notification.
      let embed = new EmbedBuilder();
      let name = m.nickname ?? m.name;

      embed.setTitle("XR Lab Status");
      embed.setFooter({ text: "AVW 4176" });
      embed.setDescription(`${name} has checked into the XR Lab!`);
      embed.setColor([133, 212, 49]);
      embed.setTimestamp(new Date());

      var profileFile : AttachmentBuilder | undefined
      if (m.profile.picture) {
        let profileAttachment = await createAttachmentFromMedia(m.profile.picture);
        profileFile = profileAttachment.attachment
        embed.setThumbnail(profileAttachment.url)
      }

      await sendGuildMessage("lab", { embeds: [embed], files: profileFile ? [profileFile] : [] });
    });
  }
};

export default LabStatusHook;
