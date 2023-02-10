import { stat } from "fs";
import payload from "payload";
import { updateLabStatusMessage } from "../../globals/util/LabUtil";
import { GlobalSlugs } from "../../slugs";
import { Bot } from "../../types/PayloadSchema";
import { XRCSuiteStatusChannelType } from "../../types/XRCTypes";
import { getGuildChannelById, updateGetStartedMessage } from "../util";
import MultiMessageManager from "./MultiMessageManager";

async function createMultiMessageManager(type: XRCSuiteStatusChannelType) {
    let discord = await payload.findGlobal<Bot>({
        slug: GlobalSlugs.Discord
    })

    let statusChannel = discord.guild.statusChannels[type]
    if (!statusChannel.channelId)
        return null;

    let channel = await getGuildChannelById(statusChannel.channelId)
    let msgIds = statusChannel.messages.map(o => o.messageId)

    if (channel && msgIds) {
        let manager = new MultiMessageManager(statusChannel.channelId, msgIds)
        manager.addNewMessageIdListener(async newMessageIds => {
            let bot = await payload.findGlobal<Bot>({ slug: GlobalSlugs.Discord, depth: 0 });
            await payload.updateGlobal<Bot>({
                slug: GlobalSlugs.Discord, depth: 0, data: {
                    ...bot,
                    guild: {
                        ...bot.guild,
                        statusChannels: {
                            ...bot.guild.statusChannels,
                            [type]: {
                                ...bot.guild.statusChannels[type],
                                messages: newMessageIds.map(t => ({ messageId: t }))
                            }
                        }
                    }
                }
            })
        })

        return manager;
    }

    return null;
}

var StatusChannelManagers: Record<XRCSuiteStatusChannelType, MultiMessageManager | null>;

export async function createAndUpdateStatusChannelManagers() {
    StatusChannelManagers = {
        lab: await createMultiMessageManager("lab"),
        leadership: await createMultiMessageManager("leadership"),
        inventory: await createMultiMessageManager("inventory"),
        getStarted: await createMultiMessageManager("getStarted")    
    }
    
    // Lab
    await updateLabStatusMessage();

    // Get Started
    await updateGetStartedMessage();
}

export function getStatusChannelManager(type: XRCSuiteStatusChannelType) {
    return StatusChannelManagers[type];
}
