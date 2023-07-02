import { Field } from "payload/types"
import { createDiscordChannelComponent } from "../../components/fields/DiscordChannelField"
import { FieldBaseNoType } from "../../types/XRCTypes"

export function createDiscordChannelField(field: FieldBaseNoType, channelTypes: number[]): Field {
    let component = createDiscordChannelComponent(channelTypes)
    return {
        ...field,
        type: "text",
        admin: {
            components: {
                Field: component
            }
        }
    }
}