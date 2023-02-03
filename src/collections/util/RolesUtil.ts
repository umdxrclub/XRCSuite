import { ActionRowBuilder } from "@discordjs/builders";
import { ActionRow, ButtonStyle, ButtonBuilder } from "discord.js";
import payload from "payload";
import { getStatusChannelManager } from "../../discord/multi/multi";
import { createAttachmentFromImageData, DiscordMessage } from "../../discord/util";
import { CollectionSlugs } from "../../slugs";
import { Member, Role } from "../../types/PayloadSchema";
import { createImageBanner } from "../../util/image";
import { resolveDocument } from "../../util/payload-backend";

export async function getLeadershipRoles(): Promise<Role[]> {
    let roleDocs = await payload.find<Role>({
        collection: CollectionSlugs.Roles, where: {
            isLeadership: {
                equals: true
            },
        },
        limit: 100
    })

    let roles = roleDocs.docs;
    roles.sort((a, b) => b.priority - a.priority)
    return roles;
}

export function getHighestRole(roles: Role[]): Role | null {
    var highestRole: Role | null = null

    if (roles.length > 0) {
        highestRole = roles.reduce((h, r) => {
            let isHigher = r.priority < h.priority;
            return isHigher ? r : h;
        }, roles[0]);
    }

    return highestRole;
}

export async function isMemberLeadership(member: Member) {
    let unresolvedRoles = member.roles ?? [];
    let promises: Promise<Role>[] = unresolvedRoles.map(r => resolveDocument(r, CollectionSlugs.Roles))
    let roles = await Promise.all(promises);

    return roles.some(r => r.isLeadership)
}

export async function updateRolesSelectMessage() {
    let roles = getStatusChannelManager("roles")
    if (roles) {
        let msg = await createRoleSelectMessage()
        await roles.setMessages([msg])
    }
}

export async function createRoleSelectMessage(): Promise<DiscordMessage> {
    let roleDocs = await payload.find<Role>({
        collection: CollectionSlugs.Roles, limit: 100, where: {
            and: [
                {
                    isSelfAssignable: {
                        equals: true
                    }
                },
                {
                    discordRoleId: {
                        not_equals: undefined
                    }
                }
            ]
            
        }
    })
    let roles = roleDocs.docs;
    let numRoles = roleDocs.totalDocs;
    let numRows = Math.ceil(numRoles / 5);
    let rows: ActionRowBuilder<ButtonBuilder>[] = []
    for (var r = 0; r < numRows; r++) {
        let start = r * 5;
        let end = Math.min(numRoles, start + 5);
        let row = new ActionRowBuilder<ButtonBuilder>();
        for (var i = start; i < end; i++) {
            let role = roles[i];

            let builder = new ButtonBuilder()
                .setCustomId(`Roles-${role.id}`)
                .setStyle(ButtonStyle.Primary)
                .setLabel(role.name)

            if (role.discordEmoji)
                builder = builder.setEmoji(role.discordEmoji)

            row.addComponents(builder)
        }

        rows.push(row)
    }

    let banner = await createImageBanner("Select a role!");
    let files = []
    if (banner) {
        let bannerAttachment = await createAttachmentFromImageData(banner);
        files.push(bannerAttachment.attachment)
    }
    

    return { components: rows, files }
}