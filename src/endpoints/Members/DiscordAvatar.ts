import { Endpoint } from "payload/config";
import { getDiscordClient } from "../../discord/bot";
import { CollectionSlugs } from "../../slugs";
import { Member } from "../../types/PayloadSchema";

const DiscordAvatarEndpoint: Endpoint = {
    path: "/discord/:id",
    method: "get",
    handler: async (req, res) => {
        let member = await req.payload.findByID<Member>({ collection: CollectionSlugs.Members, id: req.params.id })

        if (member.integrations.discord) {
            let client = await getDiscordClient();
            let user = await client.users.fetch(member.integrations.discord)
            if (user) {
                let avatar = user.displayAvatarURL()
                res.redirect(avatar)
                return;
            }
        }

        res.status(404).send()
    }
}

export default DiscordAvatarEndpoint;