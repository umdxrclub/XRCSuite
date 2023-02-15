import payload from "payload";
import { FieldHook } from "payload/types";

/**
 * Upon the default role being changed, this will give everyone in the guild the
 * role as necessary.
 */
const DefaultRoleChangedHook: FieldHook = async args => {
    if (args.operation === "create" || args.operation === "update") {
        if (args.value) {
            let role = await payload.findByID({ collection: "roles", id: args.value })
            if (role && role.discordRoleId) {
                // addRoleToEveryone(role.discordRoleId)
            }
        }
    }
    
}

export default DefaultRoleChangedHook;