import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import payload from "payload";
import { createAttachmentFromMedia, sendGuildMessage } from "../../discord/util";
import { getDocumentId } from "../../payload";
import { CollectionSlugs } from "../../slugs";
import { Description } from "../../types/PayloadSchema";
import { getPublicDevices } from "./DevicesUtil";

export async function createDeviceDescriptionEmbed(description: Description) {
    let embed = new EmbedBuilder()
    embed.setTitle(description.name)

    var attachment: AttachmentBuilder = undefined
    if (description.image) {
        let image = await createAttachmentFromMedia(description.image);
        attachment = image.attachment;
        embed.setThumbnail(image.url)
    }

    return {
        embed,
        attachment
    };
}

export async function publishInventoryInDiscord() {
    let devices = await getPublicDevices()
    let descriptionIds = new Set<string>(devices.map(d => getDocumentId(d.description)))
    let descriptionPromises: Promise<Description>[] = []
    descriptionIds.forEach(id => descriptionPromises.push(payload.findByID({ id: id, collection: CollectionSlugs.Descriptions })))
    let descriptions = await Promise.all(descriptionPromises);
    let embeds = descriptions.map(createDeviceDescriptionEmbed)

    await sendGuildMessage("inventory", { content: "test" })
}