import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import payload from "payload";
import { sendDiscordMessages } from "../../collections/util/MessageUtil";
import { createAttachmentFromMedia, DiscordMessage } from "../../discord/util";
import { Lab, Media } from "../../types/PayloadSchema";

let LabGoogleMapsURL = "https://goo.gl/maps/y9SHsm25SB874n6H8"

export async function updateLabStatusMessage() {
    let lab = await payload.findGlobal({slug: "lab"})
    // Update status message
    if (lab.discord.labMessage) {
        let labStatusMsg = await createLabStatusEmbedMessage();
        await sendDiscordMessages(lab.discord.labMessage, [ labStatusMsg ])
    }
}

export async function createLabStatusEmbedMessage(): Promise<DiscordMessage> {
    let lab = await payload.findGlobal({ slug: "lab" });
    let embed = new EmbedBuilder();

    if (lab.open) {
        embed.addFields({
            name: "Member Count",
            value: (lab.members?.length ?? 0).toString()
        })
    }

    // Determine whether an image banner can be added
    var bannerMedia: Media | string | undefined = undefined
    if (lab.open && lab.media.labOpenImage) {
        bannerMedia = lab.media.labOpenImage
    } else if (!lab.open && lab.media.labClosedImage) {
        bannerMedia = lab.media.labClosedImage
    } else {
        embed.setTitle("XR Lab Status");
        embed.setDescription(lab.open ? "The XR Lab is open!" : "The XR Lab is closed.");
    }

    // Resolve and add the image banner
    var bannerAttachment: AttachmentBuilder | undefined = undefined
    if (bannerMedia) {
        let attachment = await createAttachmentFromMedia(bannerMedia);
        bannerAttachment = attachment.attachment;
        embed.setImage(attachment.url)
    }

    embed.setFooter({ text: "AVW 4176" });
    embed.setColor(lab.open ? [133, 212, 49] : [212, 82, 49]);
    embed.setTimestamp(new Date());

    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setURL(LabGoogleMapsURL)
            .setStyle(ButtonStyle.Link)
            .setEmoji("📍")
            .setLabel("View on Google Maps")
        )

    let msg: DiscordMessage = { embeds: [embed], files: bannerAttachment ? [bannerAttachment] : [], components: [row] }

    return msg;
}