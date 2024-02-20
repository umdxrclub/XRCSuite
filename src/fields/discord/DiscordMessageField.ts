import { FieldBase, RichTextField } from "payload/dist/fields/config/types"

type DiscordMessageField = Omit<FieldBase, "type"> & {
    
}

export function createDiscordMessageField(field: DiscordMessageField): RichTextField {
    return {
        ...field,
        type: "richText",
        admin: {
            // leaves: ["bold", "italic", "strikethrough", "code", "underline"],
            // elements: ["blockquote"],
        },
    }
}