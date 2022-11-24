import { FieldHook } from "payload/types";
import { serveDiscordBot } from "../../discord/bot";

const BotUpdateHook: FieldHook = async (args) => {
    serveDiscordBot()
}

export default BotUpdateHook;