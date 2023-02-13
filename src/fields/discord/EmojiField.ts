import { FieldBase } from "payload/dist/fields/config/types"
import { Field } from "payload/types"
import DiscordEmojiField from "../../components/fields/DiscordEmojiField"

type DiscordEmojiField = Omit<FieldBase, "type"> & {

}

export const createDiscordEmojiField: (field: DiscordEmojiField) => Field = field => {
    return {
        ...field,
        type: "text",
        admin: {
            components: {
                Field: DiscordEmojiField
            }
        }
    }
}