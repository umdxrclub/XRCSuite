import { Interaction, CacheType } from "discord.js"
import LabControlInteractionHandler from "./LabControlInteraction";
import RolesMessageInteractionHandler from "./RolesInteraction"
import TrelloInteractionHandler from "./TrelloInteraction";

export type InteractionHandler = (interaction: Interaction<CacheType>) => void

const BotInteractions: InteractionHandler[] = [
    RolesMessageInteractionHandler,
    LabControlInteractionHandler,
    TrelloInteractionHandler
]

export default BotInteractions;