import { EmbedBuilder } from "@discordjs/builders";
import payload from "payload";
import { GlobalAfterChangeHook } from "payload/types";
import { sendGuildMessage } from "../../discord/util";
import { CollectionSlugs } from "../../slugs";

const LabStatusHook: GlobalAfterChangeHook = async (args) => {
  // Check if the lab status has changed.
  let notifyStatus = args.doc.settings.notifyStatus;
  let openStatusChanged = args.previousDoc.open != args.doc.open;
  if (openStatusChanged && notifyStatus) {
    let labOpen = args.doc.open as boolean; 

    // Send Discord notification.
    let embed = new EmbedBuilder();

    embed.setTitle("XR Lab Status");
    embed.setFooter({ text: "AVW 4176" });
    embed.setDescription(
      labOpen ? "The XR Lab is now open!" : "The XR Lab is now closed."
    );
    embed.setColor(labOpen ? [133, 212, 49] : [212, 82, 49]);
    embed.setTimestamp(new Date());

    await sendGuildMessage("notifications", { embeds: [embed] });
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
          await payload.findByID({
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

      embed.setTitle("XR Lab Status");
      embed.setFooter({ text: "AVW 4176" });
      embed.setDescription(`${m.name} has checked into the XR Lab!`);
      embed.setColor([133, 212, 49]);
      embed.setTimestamp(new Date());

      await sendGuildMessage("notifications", { embeds: [embed] });
    });
  }
};

export default LabStatusHook;
