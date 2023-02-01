import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import payload from "payload";
import { bulkSendGuildMessages, createAttachmentFromImageData, createAttachmentFromMedia, DiscordMessage, sendGuildMessage } from "../../discord/util";
import { getDocumentId, getOptionLabel } from "../../payload";
import { CollectionSlugs } from "../../slugs";
import { Description } from "../../types/PayloadSchema";
import { DescriptionType } from "../../types/XRCTypes";
import { createImageBanner } from "../../util/image";
import { getPublicDevices } from "./DevicesUtil";

export async function createDeviceDescriptionMessage(description: Description): Promise<DiscordMessage> {
    let embed = new EmbedBuilder()
    embed.setTitle(description.name)

    var attachment: AttachmentBuilder = undefined
    if (description.image) {
        let image = await createAttachmentFromMedia(description.image);
        attachment = image.attachment;
        embed.setThumbnail(image.url)
    }

    return { embeds: [embed], files: attachment ? [attachment] : [] }
}

export async function postPublicInventoryInDiscord() {
    let devices = await getPublicDevices()
    let descriptionIds = new Set<string>(devices.map(d => getDocumentId(d.description)))
    let descriptionPromises: Promise<Description>[] = []
    descriptionIds.forEach(id => descriptionPromises.push(payload.findByID({ id: id, collection: CollectionSlugs.Descriptions })))
    let allDescriptions = await Promise.all(descriptionPromises);

    let descriptionMap: Map<string, Description[]> = new Map();
    allDescriptions.forEach(d => {
        if (!descriptionMap.has(d.type)) {
            descriptionMap.set(d.type, [])
        }

        descriptionMap.get(d.type).push(d)
    })

    let messages: DiscordMessage[] = []

    for (var pair of Array.from(descriptionMap.entries())) {
        let [ type, descriptions ] = pair;
        let bannerImage = await createImageBanner(getOptionLabel(DescriptionType, type))
        let bannerAttachment = createAttachmentFromImageData(bannerImage);

        let descriptionMessages = await Promise.all(descriptions.map(createDeviceDescriptionMessage))

        messages.push({ files: [bannerAttachment] }, ...descriptionMessages)
    }


    await bulkSendGuildMessages("inventory", messages)
}