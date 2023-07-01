import { ButtonStyle } from "discord.js";
import payload from "payload";
import { createButtonRowComponents, DiscordMessage } from "../../discord/util";
import { resolveDocument } from "../../server/payload-backend";
import { Member, Role } from "../../types/PayloadSchema";

export async function getLeadershipRoles(): Promise<Role[]> {
    let roleDocs = await payload.find({
        collection: "roles", where: {
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
    let promises: Promise<Role>[] = unresolvedRoles.map(r => resolveDocument(r, "roles"))
    let roles = await Promise.all(promises);

    return roles.some(r => r.isLeadership)
}

export async function createRoleSelectMessage(): Promise<DiscordMessage> {
    let roleDocs = await payload.find({
        collection: "roles", limit: 100, where: {
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
    let rows = createButtonRowComponents(roles.map(doc => ({
        style: ButtonStyle.Primary,
        emoji: doc.discordEmoji,
        label: doc.name,
        customId: `Roles-${doc.id}`
    })))
    return { components: rows }
}
