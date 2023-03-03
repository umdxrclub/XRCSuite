import { Block } from "payload/types";
import { createTimeBlockField } from "../../util/payload";

const Closing: Block = {
    slug: "closing",
    fields: [
        createTimeBlockField({
            name: "time"
        }),
        {
            name: "note",
            type: "textarea"
        }
    ]
}

export default Closing