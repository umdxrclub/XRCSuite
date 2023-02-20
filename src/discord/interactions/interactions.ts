import { Interaction, CacheType } from "discord.js"
import LabControlInteractionHandler from "./LabControlInteraction";
import RolesMessageInteractionHandler from "./RolesInteraction"

export type InteractionHandler = (interaction: Interaction<CacheType>) => void

const BotInteractions: InteractionHandler[] = [
    RolesMessageInteractionHandler,
    LabControlInteractionHandler
]

export default BotInteractions;