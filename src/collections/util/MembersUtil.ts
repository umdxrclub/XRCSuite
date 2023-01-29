import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import payload from "payload";
import { Where } from "payload/types";
import { getDiscordClient } from "../../discord/bot";
import { bulkSendGuildMessages, createAttachmentFromMedia, DiscordMessage } from "../../discord/util";
import { getOptionLabel, rgbToNumber } from "../../payload";
import { CollectionSlugs, GlobalSlugs } from "../../slugs";
import { Bot, Media, Member } from "../../types/PayloadSchema";
import { LeadershipRoles, MemberProfile, ProfileLinks, ResolveMethod } from "../../types/XRCTypes";
import { getLabTerpLinkEvent } from "../../util/lab";
import { RosterMember } from "../../util/terplink";
import XRC from "../../util/XRC";
import Members from "../Members";

export async function getAllLeadershipMembers(): Promise<Member[]> {
    let leadershipMembers = await payload.find<Member>({
        collection: CollectionSlugs.Members,
        where: {
            and: [
                {
                    leadershipRoles: {
                        not_equals: undefined
                    }
                },
                {
                    leadershipRoles: {
                        not_equals: []
                    }
                }
            ]
        },
        limit: 100
    })

    let leadership = leadershipMembers.docs;
    let leadershipAndRole = leadership.map(l => {
        let roles = l.leadershipRoles ?? []
        let roleIndices = roles
            .map(r => LeadershipRoles.findIndex(o => o.value == r))
            .map(i => i == -1 ? 1000 : i) // replace not found with highest index

        let lowestIndex = Math.min(...roleIndices)
        return {
            member: l,
            index: lowestIndex
        }
    })

    // Sort by roles, then by names within the role
    leadershipAndRole.sort((a,b) => {
        if (a.index == b.index) {
            return a.member.name.localeCompare(b.member.name)
        } else {
            return a.index - b.index
        }
    })

    return  leadershipAndRole.map(lr => lr.member);
}

export function getHighestLeadershipRole(member: Member): string | undefined {
    let roles = member.leadershipRoles ?? []
    if (roles.length > 0) {
        let roleIndices = roles
        .map(r => LeadershipRoles.findIndex(o => o.value == r))
        .map(i => i == -1 ? 1000 : i) // replace not found with highest index

        let lowestIndex = Math.min(...roleIndices)
        return LeadershipRoles[lowestIndex].value
    }

    return undefined
}

/**
 * Gets a Member from their Discord id.
 *
 * @param id The id of the Discord member
 * @returns Whether the member is registered within the club database.
 */
export async function getMemberFromDiscordId(id: string): Promise<Member | undefined> {
    let docs = await payload.find({
        collection: CollectionSlugs.Members,
        where: {
            'integrations.discord': {
                equals: id
            }
        }
    })

    return docs.totalDocs == 1 ? docs.docs[0] : undefined;
}

export async function isDiscordMemberLeadership(id: string): Promise<boolean> {
    let member = await getMemberFromDiscordId(id);

    if (member) {
        let roles = member.leadershipRoles ?? []
        return roles.length > 0
    }

    return false;
}

export function createMemberProfile(member: Member): MemberProfile {
    var profilePic: string | undefined = undefined
    switch (typeof(member.profile.picture))
    {
        case "string":
            profilePic = member.profile.picture;

        case "object":
            profilePic = (member.profile.picture as Media).url;
    }

    return {
        name: member.name,
        nickname: member.nickname,
        leadershipRoles: member.leadershipRoles,
        profilePictureUrl: profilePic,
        bio: member.profile.bio,
        links: member.profile.links.map(l => ({ type: l.type, url: l.url }))
    }
}

export async function createMemberEmbedMessage(member: Member): Promise<DiscordMessage> {
    let discord = await payload.findGlobal<Bot>({ slug: GlobalSlugs.Discord });
    let embed = new EmbedBuilder()
    var files = []
    let color: string | undefined

    var name = member.name
    if (member.nickname) {
        name = `"${member.nickname}" - ${name}`
    }
    embed.setTitle(name)
    if (member.profile.picture) {
        let profileAttachment = await createAttachmentFromMedia(member.profile.picture)
        embed.setThumbnail(profileAttachment.url)
        files.push(profileAttachment.attachment)
    } else if (member.integrations.discord) {
        let client = await getDiscordClient()
        let discordMember = await client.users.fetch(member.integrations.discord)
        if (discordMember) {
            embed.setThumbnail(discordMember.displayAvatarURL())
        }
    }

    if (member.profile.bio) {
        embed.setDescription(member.profile.bio)
    }

    if (member.leadershipRoles) {
        let labels = member.leadershipRoles.map(r => getOptionLabel(LeadershipRoles, r))
        embed.addFields({
            name: "Roles",
            value: labels.join(", ")
        })

        // Determine embed color
        let roleType = getHighestLeadershipRole(member);
        if (discord.guild.leadershipColors[roleType]) {
            color = discord.guild.leadershipColors[roleType]
        } else if (discord.guild.defaultLeadershipColor) {
            color = discord.guild.defaultLeadershipColor
        }
    }

    let row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder()
    member.profile.links.forEach(link => {
        var builder = new ButtonBuilder()
            .setLabel(getOptionLabel(ProfileLinks, link.type))
            .setURL(link.url)
            .setStyle(ButtonStyle.Link)

        let emoji = discord.guild.profileLinkEmojis[link.type]
        if (emoji) {
            builder = builder.setEmoji(emoji)
        }

        row.addComponents(builder)
    })


    if (color) {
        embed.setColor(rgbToNumber(color))
    }

    return { embeds: [embed], files, components: row.components.length > 0 ? [row] : undefined }
}

export async function resolveMember(method: ResolveMethod, value: string): Promise<Member | undefined> {
    var key: string = ""

    // Construct a where query to see if this member is already within the
    // database.
    if (method == "card") {
        key = "umd.cardSerial"
    } else if (method == "terplink") {
        key = "umd.terplink.issuanceId"
    }

    let where: Where = {
        [key]: {
            equals: value
        }
    }

    // Search for the member.
    let search = await payload.find<Member>({
        collection: Members.slug,
        where: where
    })

    if (search.totalDocs == 1) {
        // A member was found in our database!
        return search.docs[0];
    } else if (search.totalDocs == 0) {
        // No member was found within our database, see if we can find them on
        // TerpLink.

        if (method != "terplink") {
            // If we don't have a TerpLink issuance id, then there's nothing
            // more we can do to resolve this user, so return undefined.
            return undefined;
        }

        console.log("trying to resolve with issuance ", method, value)

        // Fetch the member on TerpLink by their issuance id using the XR Lab
        // event.
        let tlEvent = await getLabTerpLinkEvent();
        let tlMember = await tlEvent.getMemberFromIssuanceId(value);

        // If we couldn't find a TerpLink member by their issuance id, then
        // something sus happened and we cannot resolve them.
        if (!tlMember) {
            return undefined;
        }

        // Now try to search for them in the roster and match them by their
        // email.
        let rosterName = tlMember.getRosterName();
        let roster = await XRC.terplink.getRosterMembers(rosterName);
        var foundRosterMember: RosterMember | undefined = undefined
        var foundEmail: string | undefined = undefined;

        for (var i = 0; i < roster.length && !foundRosterMember; i++) {
            let rosterMember = roster[i];
            let rosterMemberEmail = await rosterMember.fetchEmail();
            let tlMembers = await tlEvent.lookupMembers(rosterMemberEmail);
            if (tlMembers.length == 1) {
                let rosterTerpLinkMember = tlMembers[0];

                // Check if same member by comparing their member IDs.
                if (rosterTerpLinkMember.getMemberId() == tlMember.getMemberId()) {
                    foundRosterMember = rosterMember;
                    foundEmail = rosterMemberEmail
                }
            }
        }

        var existingId: string | undefined = undefined
        var partialMember: Partial<Member> = {
            name: tlMember.getName(),
            isClubMember: !!foundRosterMember,
            umd: {
                terplink: {
                    accountId: tlMember.getMemberId(),
                    issuanceId: value,
                    communityId: foundRosterMember.communityId
                }
            }
        }

        if (foundRosterMember) {
            // Add their email
            partialMember['email'] = foundEmail;

            // See if this roster member was already in the database, since they
            // could have been added when we did a roster import.
            let search = await payload.find({
                collection: Members.slug,
                where: {
                    'umd.terplink.communityId': {
                        equals: foundRosterMember.communityId
                    }
                }
            })

            if (search.totalDocs == 1) {
                let foundMember = search.docs[0]
                existingId = foundMember.id
            }
        }

        var member: Member;
        if (existingId) {
            member = await payload.update({
                collection: Members.slug,
                id: existingId,
                data: partialMember
            })
        } else {
            member = await payload.create({
                collection: Members.slug,
                data: partialMember
            })
        }

        return member;
    }
}

export async function postLeadershipInDiscord() {
    let leadership = await getAllLeadershipMembers();
    let messages = await Promise.all(leadership.map(createMemberEmbedMessage))
    await bulkSendGuildMessages("leadership", messages.reverse())
}