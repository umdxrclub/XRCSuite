import { FieldBase } from "payload/dist/fields/config/types"
import { Field } from "payload/types"
import DiscordMemberField from "../components/dashboard/DiscordMemberField"

type DiscordMemberField = Omit<FieldBase, "type"> & {

}

export const createDiscordMemberField: (field: DiscordMemberField) => Field = field => {
    return {
        ...field,
        type: "text",
        admin: {
            components: {
                Field: DiscordMemberField
            }
        }
    }
}