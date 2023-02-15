import { Block } from "payload/types";
import { createTimeBlockField } from "../../payload";

const Closing: Block = {
    slug: "closing",
    fields: [
        createTimeBlockField({
            name: "time"
        })
    ]
}

export default Closing