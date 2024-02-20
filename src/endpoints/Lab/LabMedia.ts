import { Endpoint } from "payload/config";
import { resolveDocument } from "../../server/payload-backend";
import { Media } from "../../types/PayloadSchema";
import { LabMediaType } from "../../types/XRCTypes";

const LabMediaEndpoint: Endpoint = {
  path: "/media/:type",
  method: "get",
  handler: async (req, res) => {
    let lab = await req.payload.findGlobal({ slug: "lab" });
    let mediaType = req.params.type as LabMediaType;

    var media: Media | string | undefined | null = undefined;
    switch (mediaType) {
      case "accept-sound":
        media = lab?.media?.gatekeeper?.acceptSound ;
        break;

      case "reject-sound":
        media = lab?.media?.gatekeeper?.rejectSound;
        break;

      case "tv":
        media = lab?.media?.tvBanner;
        break;
    }

    if (media) {
      let resolvedMedia = await resolveDocument(media, "media");
      let redirectUrl = resolvedMedia.url;
      if (redirectUrl) {
        res.redirect(redirectUrl);
      } else {
        res.status(404).send();
      }
    } else {
      res.status(404).send();
    }
  },
};

export default LabMediaEndpoint;
