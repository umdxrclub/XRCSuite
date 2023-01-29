import { Endpoint } from "payload/config";
import { CollectionSlugs, GlobalSlugs } from "../../slugs";
import { Lab, Media } from "../../types/PayloadSchema";
import { LabMediaType } from "../../types/XRCTypes";
import { resolveDocument } from "../../util/payload-backend";

const LabMediaEndpoint: Endpoint = {
    path: "/media/:type",
    method: "get",
    handler: async (req, res) => {
        let lab = await req.payload.findGlobal<Lab>({ slug: GlobalSlugs.Lab });
        let mediaType = req.params.type as LabMediaType

        var media: Media | string | undefined = undefined
        switch (mediaType) {
            case "accept-sound":
                media = lab.settings.gatekeeper.acceptSound
                break;

            case "reject-sound":
                media = lab.settings.gatekeeper.rejectSound
                break;
        }

        if (media) {
            let resolvedMedia = await resolveDocument(media, CollectionSlugs.Media);
            let redirectUrl = resolvedMedia.url;
            res.redirect(redirectUrl)
        } else {
            res.status(404).send()
        }
    }
}

export default LabMediaEndpoint;