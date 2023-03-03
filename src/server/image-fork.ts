import { createCanvas, loadImage, registerFont } from "canvas";
import { ForkFunction } from "./image";

const FontPrefix = "font://"

async function createBanner(bgPath: string, text: string, font: string): Promise<string> {
    if (font.startsWith(FontPrefix)) {
        registerFont(font.split(FontPrefix)[1], { family: "Custom Font" })
        font = "Custom Font"
    }

    let bg = await loadImage(bgPath)
    let canvas = createCanvas(bg.width, bg.height)
    let ctx = canvas.getContext('2d')

    // Draw banner
    ctx.drawImage(bg, 0, 0)

    ctx.fillStyle = "white"
    let fontSize = Math.round(0.6 * bg.height)
    ctx.font = `${fontSize}px ${font}`
    let textSize = ctx.measureText(text)
    let textHeight = textSize.actualBoundingBoxAscent - textSize.actualBoundingBoxDescent
    ctx.fillText(text, (bg.width - textSize.width) / 2, (bg.height + textHeight) / 2)

    let data = canvas.toDataURL()

    return data;
}

let Functions = [ createBanner ]

process.on("message", async msg => {
    let func = JSON.parse(msg as string) as ForkFunction

    let foundFunc = Functions.find(f => f.name == func.name);
    if (foundFunc) {
        let output = foundFunc.call(this, ...func.args)
        process.send(await output)
    } else {
        process.send("FAIL")
    }
})
