import payload from "payload";
import { FieldHook } from "payload/types";
import { addRoleToEveryone } from "../../discord/util";

/**
 * Upon the default role being changed, this will give everyone in the guild the
 * role as necessary.
 */
const DefaultRoleChangedHook: FieldHook = async args => {
    if (args.operation === "create" || (args.operation === "update" && args.previousValue != args.value)) {
        if (args.value) {
            addRoleToEveryone(args.value)
        }
    }
}

export default DefaultRoleChangedHook;