import { Field } from "payload/types"

type DiscordMemberField = Omit<Field, "type"> & {

}
const createDiscordMemberField: (field: DiscordMemberField) => Field = field => {
    return {
        ...field,
        type: "text"
    }
}