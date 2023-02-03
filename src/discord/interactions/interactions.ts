import { Interaction, CacheType } from "discord.js"
import RolesMessageInteractionHandler from "./RolesInteraction"

export type InteractionHandler = (interaction: Interaction<CacheType>) => void

const BotInteractions: InteractionHandler[] = [
    RolesMessageInteractionHandler
]

export default BotInteractions