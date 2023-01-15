import { FieldHook } from "payload/types";
import { serveDiscordBot } from "../../discord/bot";

const BotUpdateHook: FieldHook = async (args) => {
    if (args.previousValue != args.value) {
        serveDiscordBot()
    }
}

export default BotUpdateHook;