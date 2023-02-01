import { EmbedBuilder } from "@discordjs/builders";
import { AttachmentBuilder } from "discord.js";
import payload from "payload";
import { GlobalAfterChangeHook } from "payload/types";
import BulkMessageManager from "../../discord/BulkMessageManager";
import { createAttachmentFromMedia, getBulkMessageIds, getGuildChannel, sendGuildMessage } from "../../discord/util";
import { createLabStatusEmbedMessage } from "../../globals/util/LabUtil";
import { getDocumentId } from "../../payload";
import { CollectionSlugs, GlobalSlugs } from "../../slugs";
import { Bot, Lab, Media, Member } from "../../types/PayloadSchema";

var labStatusBulkEditor: BulkMessageManager | undefined = undefined

async function getBulkManager() {
  if (!labStatusBulkEditor) {
    let channel = await getGuildChannel("lab");
    let msgIds = await getBulkMessageIds("lab");
    if (channel && msgIds) {
      labStatusBulkEditor = new BulkMessageManager(channel.id, msgIds)
      labStatusBulkEditor.addNewMessageIdListener(async newMessageIds => {
        let bot = await payload.findGlobal<Bot>({ slug: GlobalSlugs.Discord, depth: 0 });
        await payload.updateGlobal<Bot>({ slug: GlobalSlugs.Discord, depth: 0, data: {
          ...bot,
          bulkMessages: {
            ...bot.bulkMessages,
            lab: newMessageIds.map(id => ({ messageId: id }))
          }
        }})
      })
    }
  }

  return labStatusBulkEditor;
}

const LabStatusHook: GlobalAfterChangeHook = async (args) => {
  // Check if the lab status has changed.
  let doc = args.doc as Lab;
  let prevDoc = args.previousDoc as Lab;

  let bulk = await getBulkManager();
  if (bulk) {
    let labStatusMsg = await createLabStatusEmbedMessage();
    bulk.setMessages([labStatusMsg])
  }

  // Determine the members who have checked in/out.
  let prevMembers = prevDoc.members?.map(getDocumentId) ?? [];
  let currentMembers = doc.members?.map(getDocumentId) ?? [];
  let newMemberIds = currentMembers.filter((id) => !prevMembers.includes(id));
  let removedMemberIds = prevMembers.filter(
    (id) => !currentMembers.includes(id)
  );
  let announceRoles = doc.settings.rolesToAnnounce ?? [];

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
      (m.roles ?? []).some((r) => announceRoles.includes(r))
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
