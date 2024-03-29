import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import payload from "payload";
import { Where } from "payload/types";
import { getDiscordClient } from "../../discord/bot";
import {
  bulkSendGuildMessages,
  createAttachmentFromMedia,
  DiscordMessage,
} from "../../discord/util";
import { rgbToNumber } from "../../util/payload";
import { Media, Member, Role } from "../../types/PayloadSchema";
import { MemberProfile, ResolveMethod } from "../../types/XRCTypes";
import { getLabTerpLinkEvent } from "../../server/lab";
import { resolveDocument } from "../../server/payload-backend";
import { RosterMember } from "../../server/terplink";
import XRC from "../../server/XRC";
import {
  getHighestRole,
  getLeadershipRoles,
  isMemberLeadership,
} from "./RolesUtil";

export async function getAllLeadershipMembers(): Promise<Member[]> {
  let leadershipRoles = await getLeadershipRoles();
  let leadershipRoleIds = leadershipRoles.map((r) => r.id);

  let leadershipMembersDocs = await payload.find({
    collection: "members",
    where: {
      roles: {
        in: leadershipRoleIds,
      },
    },
    limit: 100,
  });

  let leadershipMembers = await sortMembersByRolePriority(
    leadershipMembersDocs.docs
  );
  return leadershipMembers;
}

export async function sortMembersByRolePriority(
  members: Member[]
): Promise<Member[]> {
  let memberAndRolePromises = members.map(async (m) => {
    let roles = m.roles ?? [];
    let resolvedRolesPromises: Promise<Role>[] = roles.map((r) =>
      resolveDocument(r, "roles")
    );
    let resolvedRoles = await Promise.all(resolvedRolesPromises);

    return {
      member: m,
      roles: resolvedRoles,
    };
  });

  let memberAndRoles = await Promise.all(memberAndRolePromises);

  memberAndRoles.sort((a, b) => {
    let aHighest = getHighestRole(a.roles);
    let bHighest = getHighestRole(b.roles);
    let priorityA = aHighest?.priority ?? 0;
    let priorityB = bHighest?.priority ?? 0;

    return priorityA - priorityB;
  });

  return memberAndRoles.map((mr) => mr.member);
}

/**
 * Gets a Member from their Discord id.
 *
 * @param id The id of the Discord member
 * @returns Whether the member is registered within the club database.
 */
export async function getMemberFromDiscordId(
  id: string
): Promise<Member | undefined> {
  let docs = await payload.find({
    collection: "members",
    where: {
      "integrations.discord": {
        equals: id,
      },
    },
  });

  return docs.totalDocs == 1 ? docs.docs[0] : undefined;
}

export async function isDiscordMemberLeadership(id: string): Promise<boolean> {
  let member = await getMemberFromDiscordId(id);
  if (member) {
    return isMemberLeadership(member);
  }

  return false;
}

export function createMemberProfile(member: Member): MemberProfile {
  var profilePic: string | null | undefined = undefined;
  switch (typeof member?.profile?.picture) {
    case "string":
      profilePic = member.profile.picture;

    case "object":
      profilePic = (member.profile.picture as Media).url;
  }

  return {
    name: member.name,
    nickname: member.nickname ?? undefined,
    leadershipRoles: [], // member.roles,
    profilePictureUrl: profilePic ?? undefined,
    bio: member?.profile?.bio ?? undefined,
    links: [], //member.profile.links.map(l => ({ type: l.type, url: l.url }))
  };
}

export async function createMemberEmbedMessage(
  member: Member
): Promise<DiscordMessage> {
  let embed = new EmbedBuilder();
  var files = [];
  let color: string | undefined;

  var name = member.name;
  if (member.nickname) {
    name = `"${member.nickname}" - ${name}`;
  }
  embed.setTitle(name);
  if (member?.profile?.picture) {
    let profileAttachment = await createAttachmentFromMedia(
      member.profile.picture
    );

    if (profileAttachment) {
      embed.setThumbnail(profileAttachment.url);
      files.push(profileAttachment.attachment);
    }
  } else if (member?.integrations?.discord) {
    let client = await getDiscordClient();
    if (client) {
      let discordMember = await client.users.fetch(member.integrations.discord);
      if (discordMember) {
        embed.setThumbnail(discordMember.displayAvatarURL());
      }
    }
  }

  if (member?.profile?.bio) {
    embed.setDescription(member.profile.bio);
  }

  if (member.roles && member.roles.length > 0) {
    let roles: Role[] = await Promise.all(
      member.roles.map((r) => resolveDocument(r, "roles"))
    );
    roles.sort((a, b) => a.priority - b.priority);
    let highestRole = roles[0];

    embed.addFields({
      name: "Roles",
      value: roles.map((r) => r.name).join(", "),
    });

    // Determine embed color
    if (highestRole.color) {
      embed.setColor(rgbToNumber(highestRole.color));
    }
  }

  let row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();
  // member.profile.links.forEach(link => {
  //     var builder = new ButtonBuilder()
  //         .setLabel(getOptionLabel(ProfileLinks, link.type))
  //         .setURL(link.url)
  //         .setStyle(ButtonStyle.Link)

  //     let emoji = discord.guild.profileLinkEmojis[link.type]
  //     if (emoji) {
  //         builder = builder.setEmoji(emoji)
  //     }

  //     row.addComponents(builder)
  // })

  if (color) {
    embed.setColor(rgbToNumber(color));
  }

  return {
    embeds: [embed],
    files,
    components: row.components.length > 0 ? [row] : undefined,
  };
}

export async function resolveMember(
  method: ResolveMethod,
  value: string
): Promise<Member | null> {
  var key: string = "";

  console.log(method, value);
  // Construct a where query to see if this member is already within the
  // database.
  switch (method) {
    case "card":
      key = "umd.cardSerial";
      break;

    case "terplink":
      key = "umd.terplink.issuanceId";
      break;

    case "id":
      key = "id";
      break;

    default:
      return null;
  }

  let where: Where = {
    [key]: {
      equals: value,
    },
  };

  // Search for the member.
  let search = await payload.find({
    collection: "members",
    where: where,
  });

  if (search.totalDocs == 1) {
    // A member was found in our database!
    return search.docs[0];
  } else if (search.totalDocs == 0) {
    // No member was found within our database, see if we can find them on
    // TerpLink.

    if (method != "terplink") {
      // If we don't have a TerpLink issuance id, then there's nothing
      // more we can do to resolve this user, so return undefined.
      return null;
    }

    console.log("Trying to resolve with issuance ", method, value);

    // Fetch the member on TerpLink by their issuance id using the XR Lab
    // event.
    let tlEvent = await getLabTerpLinkEvent();
    console.log("Trying to resolve with issuance id: ", value);
    let tlMember = await tlEvent?.getMemberFromIssuanceId(value);

    // If we couldn't find a TerpLink member by their issuance id, then
    // something sus happened and we cannot resolve them.
    if (!tlMember) {
      return null;
    }

    // Now try to search for them in the roster and match them by their
    // email.
    let rosterName = tlMember.getRosterName();
    console.log("Searching roster for name: " + rosterName);
    let roster = await XRC.terplink.getRosterMembers(rosterName);
    var foundRosterMember: RosterMember | undefined = undefined;
    var foundEmail: string | undefined = undefined;

    for (var i = 0; i < roster.length && !foundRosterMember; i++) {
      let rosterMember = roster[i];
      let rosterMemberEmail = await rosterMember.fetchEmail();
      let tlMembers = await tlEvent?.lookupMembers(rosterMemberEmail) ?? [];
      if (tlMembers.length == 1) {
        let rosterTerpLinkMember = tlMembers[0];

        // Check if same member by comparing their member IDs.
        if (rosterTerpLinkMember.getMemberId() == tlMember.getMemberId()) {
          foundRosterMember = rosterMember;
          foundEmail = rosterMemberEmail;
        }
      }
    }
    console.log("Roster search complete, found: " + foundRosterMember?.name);

    var existingId: string | undefined = undefined;
    var partialMember: Partial<Member> = {
      name: tlMember.getName(),
      isClubMember: !!foundRosterMember,
      umd: {
        terplink: {
          accountId: tlMember.getMemberId(),
          issuanceId: value,
          communityId: foundRosterMember?.communityId,
        },
      },
    };

    if (foundRosterMember) {
      // Add their email
      partialMember["email"] = foundEmail;

      // See if this roster member was already in the database, since they
      // could have been added when we did a roster import.
      let search = await payload.find({
        collection: "members",
        where: {
          "umd.terplink.communityId": {
            equals: foundRosterMember.communityId,
          },
        },
      });

      if (search.totalDocs == 1) {
        let foundMember = search.docs[0];
        existingId = foundMember.id;
      }
    }

    var member: Member;
    if (existingId) {
      member = await payload.update({
        collection: "members",
        id: existingId,
        data: partialMember,
      });
    } else {
      member = await payload.create({
        collection: "members",
        data: partialMember as any,
      });
    }

    return member;
  }

  return null;
}

export async function postLeadershipInDiscord() {
  let leadership = await getAllLeadershipMembers();
  let messages = await Promise.all(leadership.map(createMemberEmbedMessage));
  await bulkSendGuildMessages("leadership", messages.reverse());
}
