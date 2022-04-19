import { HTMLElement } from "node-html-parser";
import querystring from "querystring"

export const X_WWW_FORM_HEADERS_CONFIG = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
}

export function wasRequestRedirectedTo(reqUrl: string, resUrl: string, toUrl: string) {
    return !reqUrl.startsWith(toUrl) && resUrl.startsWith(toUrl)
}

export function getValueOfInputFieldWithName(e: HTMLElement, name: string) {
    try {
        return e.querySelector(`input[name=${name}]`)!.attributes.value
    } catch {
        console.error("Could not find input w/ field: " + name)
        throw new Error("Could not find input w/ field: " + name);
    }
}

export function queryStringFromForm(e: HTMLElement) {
    const inputs = e.querySelectorAll("input")
    const inputObj: Record<string, string> = {}
    inputs.forEach(input => {
        if (typeof(input.attributes.name) === "string") {
            const inputName = input.attributes.name
            inputObj[inputName] = input.attributes.value as string
        }
    })

    return querystring.stringify(inputObj)
}