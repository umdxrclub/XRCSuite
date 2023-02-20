import payload from "payload";
import { Role } from "../../types/PayloadSchema";
import { getGuild } from "../util";
import { InteractionHandler } from "./interactions";

const LabRegex = /Lab-(.*)/;

export type LabControlAction = "Open" | "Close" | "CheckOutAll"

const LabControlInteractionHandler: InteractionHandler = async interaction => {
    if (interaction.isButton() && LabRegex.test(interaction.customId)) {
        let match = LabRegex.exec(interaction.customId);
        let action = match[1] as LabControlAction;
        let lab = await payload.findGlobal({ slug: "lab", depth: 0})

        switch (action) {
            case "Open":
                await payload.updateGlobal({ slug: "lab", depth: 0, data: {
                    ...lab,
                    open: true
                }})
                await interaction.reply({ content: "The XR Lab is now open!", ephemeral: true })
                break;

            case "Close":
                await payload.updateGlobal({ slug: "lab", depth: 0, data: {
                    ...lab,
                    open: false
                }})
                await interaction.reply({ content: "The XR Lab is now closed!", ephemeral: true })
                break;

            case "CheckOutAll":
                await payload.updateGlobal({ slug: "lab", depth: 0, data: {
                    ...lab,
                    members: []
                }})
                await interaction.reply({ content: "All members have been checked out!", ephemeral: true })
                break;

            default:
                await interaction.reply({ content: "Unknown action", ephemeral: true })
                break;
        }
    }
}

export default LabControlInteractionHandler;