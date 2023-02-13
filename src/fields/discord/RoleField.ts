import { FieldBase } from "payload/dist/fields/config/types"
import { Field } from "payload/types"
import DiscordRoleField from "../../components/fields/DiscordRoleField"

type DiscordRoleField = Omit<FieldBase, "type"> & {

}

export const createDiscordRoleField: (field: DiscordRoleField) => Field = field => {
    return {
        ...field,
        type: "text",
        admin: {
            components: {
                Field: DiscordRoleField
            }
        }
    }
}