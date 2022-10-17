import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material"
import { XRCSchema } from "@xrc/XRCSchema"
import { useEffect, useState } from "react"

interface HeartbeatViewerProps {
    heartbeat: any | null,
    onClose: () => void,
}

function traverseObj(obj: any): [string, string][] {
    var keyvals: [string, string][] = []
    if (typeof obj === "object") {
        Object.keys(obj).forEach(key => {
            const val = obj[key]
            if (val != undefined && val != null) {
                switch (typeof(val)) {
                    case "object":
                        keyvals.push(...traverseObj(val))
                        break;
                    default:
                        keyvals.push([key, val.toString()])
                }
            }
        })
    }
    return keyvals
}

export const HeartbeatViewer: React.FC<HeartbeatViewerProps> = ({heartbeat, onClose}) => {
    const [ heartbeatText, setHeartbeatText ] = useState("")

    useEffect(() => {
        if (heartbeat != null) {
            const heartbeatKeyVals = traverseObj(heartbeat)
            var text = ""
            heartbeatKeyVals.forEach(item => {
                text += `${item[0]}: ${item[1]}\n`
            })
            setHeartbeatText(text)
        }
    }, [heartbeat])

    return <Dialog
        open={heartbeat !== null}
        onClose={onClose}
    >
        <DialogTitle>Heartbeat</DialogTitle>
        <DialogContent>
            <Typography style={{whiteSpace: "pre-line"}}>{heartbeatText}</Typography>
        </DialogContent>
    </Dialog>
}