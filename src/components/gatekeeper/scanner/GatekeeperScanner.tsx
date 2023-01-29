import Typography from "@mui/material/Typography";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LabMediaType, ResolveMethod } from "../../../types/XRCTypes";
import "./gatekeeper-scanner.css";
import ProceedSVG from "./proceed.svg";
import ProcessingSVG from "./processing.svg";
import { ResolveDialog } from "./ResolveDialog";
import StopSVG from "./stop.svg";

type ScannerStatus = "scanning" | "processing" | "checkin" | "checkout" | "error";
type ScannerConfig = {
    colors: Record<ScannerStatus, string>,
    titles: Record<ScannerStatus, string>,
    descriptions: Record<ScannerStatus, string>,
    icons: Record<ScannerStatus, string>,
    statusDisplayTime: number
}

export type ResolveResult = {
    error: string | undefined,
    member?: {
        name: string,
        type: "checkin" | "checkout"
    }
}
export type GatekeeperResolver = (method: ResolveMethod, value: string) => Promise<ResolveResult>

export const DefaultScannerConfig: ScannerConfig = {
    colors: {
        checkin: "#54B845",
        checkout: "#54B845",
        processing: "#DCAC13",
        scanning: "#E61A31",
        error: "red",
    },

    titles: {
        checkin: "PROCEED",
        checkout: "FAREWELL",
        processing: "STANDBY",
        scanning: "STOP",
        error: "ERROR",
    },

    descriptions: {
        checkin: "Welcome, {NAME}!",
        checkout: "See you later, {NAME}!",
        processing: "Hang tight! We are currently checking you in.",
        scanning: "Please scan your event pass before proceeding.",
        error: "{ERROR}",
    },

    icons: {
        checkin: ProceedSVG,
        checkout: ProceedSVG,
        processing: ProcessingSVG,
        error: StopSVG,
        scanning: StopSVG,
    },

    statusDisplayTime: 5 * 1000
}

type GatekeeperScannerProps = {
    resolver: GatekeeperResolver
    config?: ScannerConfig
}

type KeypressParser = {
    key: string,
    endKey?: string,
    onComplete: (value: string) => void,
    timeout?: number
}

const SWIPECARD_TRACK_LENGTH = 15
const SWIPECARD_TIMEOUT = 1000;

export const GatekeeperScanner: React.FC<GatekeeperScannerProps> = ({config, resolver}) => {
    // Swipe card
    const keystrokes = useRef<string[]>([]);
    const currentKeypressHandler = useRef<KeypressParser | undefined>(undefined);
    const keypressTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const isScanning = useRef<boolean>(true);
    const keypressHandlers = useMemo<KeypressParser[]>(() => [
        {
            key: "{",
            endKey: "}",
            onComplete: onEventPassScan,
            timeout: 2000
        },
        {
            key: "`",
            onComplete: () => setResolveDialogOpen(true)
        }
    ], [onEventPassScan]);

    const resolve = async (method: ResolveMethod, value: string) => {
        isScanning.current = false;
        setScannerStatus("processing");
        let result = await resolver(method, value)
        if (result.member) {
            setCheckedInMemberName(result.member.name);
        } else {
            setErrorString(result.error!);
        }

        showResultStatus(result.member ? result.member.type : "error");
    }

    // // QR
    // const qr = useRef<Html5Qrcode>();

    // State
    const [ scannerStatus, setScannerStatus ] = useState<ScannerStatus>("scanning");
    const [ checkedInMemberName, setCheckedInMemberName ] = useState("");
    const [ errorString, setErrorString ] = useState("");
    const [ resolveDialogOpen, setResolveDialogOpen ] = useState<boolean>(false);

    // Load default scanner config if one wasn't provided.
    config ??= DefaultScannerConfig;

    // Current scanner status metadata.
    const STATUS_TITLE = config!.titles[scannerStatus];
    const STATUS_COLOR = config!.colors[scannerStatus];
    const STATUS_ICON = config!.icons[scannerStatus];
    const STATUS_DESCRIPTION = config!.descriptions[scannerStatus].replace("{NAME}", checkedInMemberName).replace("{ERROR}", errorString);
    

    function newKeypressHandler(e: KeyboardEvent) {
        const key = e.key;
        if (!currentKeypressHandler.current) {
            let handler = keypressHandlers.find(h => h.key == key)

            // If we find a suitable handler, start recording keystrokes.
            if (handler) {
                if (handler.endKey) {
                    console.log("Starting handler...")
                    keystrokes.current = [key]
                    currentKeypressHandler.current = handler
                    keypressTimeout.current = setTimeout(() => {
                        console.log("Keypress handler timeout")
                        keypressTimeout.current = undefined
                        currentKeypressHandler.current = undefined
                    }, handler.timeout)
                } else {
                    // If there's no end key, then just call on complete
                    // immediately.
                    handler.onComplete(key)
                }
            }
        } else {
            let handler = currentKeypressHandler.current;
            // Add key press to strokes array.
            keystrokes.current.push(key);

            if (key == handler.endKey) {
                // Keystrokes complete, handle result.
                console.log("Ending handler...")
                let keystrokeString = keystrokes.current.join("");
                console.log("Parsed keystroke string: " + keystrokeString)
                handler.onComplete(keystrokeString)

                // Reset for next handler
                keystrokes.current = []
                currentKeypressHandler.current = undefined
                clearTimeout(keypressTimeout.current)
                keypressTimeout.current = undefined;
            }
        }
    }

    // function configureQRScanner() {
    //     qr.current = new Html5Qrcode("scanner");
    //     qr.current!.start({ facingMode: "user"}, QrScannerConfig, onQRScan, onQRError);
    // }

    function onEventPassScan(text: string) {
        console.log(text)
        const eventPassObj = JSON.parse(text);
        const issuanceId = eventPassObj.issuanceId;
        if (issuanceId) {
            
        }
    }

    // function onQRScan(text: string, result: Html5QrcodeResult) {
    //     // Only allow 
    //     if (result.result.format?.format == Html5QrcodeSupportedFormats.AZTEC && isScanning.current) {
    //         onEventPassScan(text);
    //     }
    // }

    // function onQRError(err: string) {

    // }

    function onSwipe(cardId: string) {
        // showResultStatus("found");
    }

    function showResultStatus(status: ScannerStatus) {
        setScannerStatus(status);

        let mediaType: LabMediaType = status == "error" ? "reject-sound" : "accept-sound";
        let sound = new Audio("/api/globals/lab/media/" + mediaType);
        sound.play().then(() => sound.remove());

        setTimeout(() => {
            setScannerStatus("scanning");
            isScanning.current = true;
        }, config?.statusDisplayTime)
    }

    useEffect(() => {
        // Process key presses for handling a swipe login.
        document.addEventListener("keypress", newKeypressHandler);

        // // Create the QR code scanner
        // configureQRScanner();

        return () => {
            document.removeEventListener("keypress", newKeypressHandler);
            // if (qr.current) {
            //     qr.current.stop();
            // }
        }
    }, [])

    return <div className="scanner-bar" style={{backgroundColor: STATUS_COLOR}}>
        <ResolveDialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} submitResolve={resolve}/>
        <div className="scanner-content">
            <div className="scanner-status-bg" >
                <Typography variant="h4">{STATUS_TITLE}</Typography>
                <div className="scanner-status-icon">
                    <img src={STATUS_ICON} />
                </div>
            </div>
            <div className="scanner-text">
                <Typography variant="h5">{STATUS_DESCRIPTION}</Typography>
            </div>
        </div>
    </div>
}