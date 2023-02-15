import payload from "payload";
import { RowLabelFunction } from "payload/dist/admin/components/forms/RowLabel/types";
import { Field, Option, OptionObject } from "payload/dist/fields/config/types"
import { hasUncaughtExceptionCaptureCallback } from "process";
import { FieldBaseNoType } from "./types/XRCTypes";

/**
 * Retrieves the id of a specified document. Payload sometimes represents documents
 * just by their ID as a string, but other times the full document is returned,
 * in which case you have to get the id via the "id" property. This will return
 * the id in either of these cases.
 *
 * @param doc The document which may just be a string id
 * @returns The id of the document
 */
export function getDocumentId(doc: string | { id: string } ) {
    return typeof(doc) === "string" ? doc : doc.id
}

export function getOptionValues(options: Option[]): string[] {
    return options.map(o => {
        if (typeof(o) === "string") {
            return o
        } else {
            return o.value
        }
    })
}

export function getOptionObjects(options: Option[]): OptionObject[] {
    return options.map(o => {
        if (typeof(o) === "object") {
            return o
        } else {
            return {
                value: o,
                label: o
            }
        }
    })
}

export function getOptionLabel(options: Option[], value: string) {
    let option = options.find(o => {
        if (typeof o == "string" && o == value) {
            return true;
        } else if (typeof o == "object" && o.value == value) {
            return true;
        }

        return false;
    })

    if (option) {
        if (typeof option == "string") {
            return option;
        } else {
            return option.label as string
        }
    }

    return undefined;
}

export function rgbToNumber(rgb: string) {
    if (rgb.startsWith("#")) {
        rgb = rgb.substring(1)
    }

    return parseInt(rgb, 16)
}

export function createTimeRangeField(field: Omit<FieldBaseNoType, "name">): Field {
    return {
        ...field,
        type: "row",
        fields: [
            {
                name: "from",
                type: "text"
            },
            {
                name: "to",
                type: "text"
            }
        ]
    }
}

export function createTimeBlockField(field: FieldBaseNoType): Field {
    return {
        ...field,
        type: "group",
        fields: [
            {
                name: "allDay",
                type: "checkbox",
                required: true,
                defaultValue: false
            },
            createTimeRangeField({
                admin: {
                    condition: data => data.allDay
                }
            })
        ]
    }
}  

export function useAsRowTitle(name: string): RowLabelFunction {
    const func: RowLabelFunction = args => args.data[name];
    return func;
}