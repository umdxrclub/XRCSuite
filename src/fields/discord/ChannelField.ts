import { FieldBase } from "payload/dist/fields/config/types"
import { Field } from "payload/types"
import DiscordChannelField from "../../components/fields/DiscordChannelField"

type DiscordChannelField = Omit<FieldBase, "type"> & {

}

export const createDiscordChannelField: (field: DiscordChannelField) => Field = field => {
    return {
        ...field,
        type: "text",
        admin: {
            components: {
                Field: DiscordChannelField
            }
        }
    }
}