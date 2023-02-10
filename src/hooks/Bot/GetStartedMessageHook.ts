import { FieldHook } from "payload/types";
import { updateGetStartedMessage } from "../../discord/util";

const GetStartedMessageChanged: FieldHook = args => {
    if (args.operation === "update") {
        console.log("updating message from hook!")
        // updateGetStartedMessage()
    }
}

export default GetStartedMessageChanged;