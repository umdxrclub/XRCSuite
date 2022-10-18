import { Paper, Typography } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { Html5QrcodeResult, Html5QrcodeSupportedFormats } from "html5-qrcode/esm/core";
import { Html5QrcodeCameraScanConfig } from "html5-qrcode/esm/html5-qrcode";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./gatekeeper-scanner.css";
import { ReactComponent as ProceedSVG } from "./proceed.svg";
import { ReactComponent as ProcessingSVG } from "./processing.svg";
import { ReactComponent as StopSVG } from "./stop.svg";

const QR_SCANNER_CONFIG: Html5QrcodeCameraScanConfig = {
    fps: 5,
}

type ScannerStatus = "scanning" | "processing" | "checkin" | "checkout" | "error";
type ScannerConfig = {
    colors: Record<ScannerStatus, string>,
    titles: Record<ScannerStatus, string>,
    descriptions: Record<ScannerStatus, string>,
    icons: Record<ScannerStatus, React.FunctionComponent<React.SVGProps<SVGSVGElement>>>,
    statusDisplayTime: number
}

type ScanMethodType = "eventPass" | "swipeCardMagnetic" | "swipeCardBarcode";
export type ResolverResult = {
    error: string | undefined,
    member?: {
        name: string,
        type: "checkin" | "checkout"
    }
}
export type GatekeeperResolver = (method: ScanMethodType, value: string) => Promise<ResolverResult>

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
    resolve: GatekeeperResolver
    config?: ScannerConfig
}

type KeypressParser = {
    startKey: string,
    endKey: string,
    onComplete: (value: string) => void,
    timeout: number
}

const SWIPECARD_TRACK_LENGTH = 15
const SWIPECARD_TIMEOUT = 1000;

export const GatekeeperScanner: React.FC<GatekeeperScannerProps> = ({config, resolve}) => {
    // Swipe card
    const keystrokes = useRef<string[]>([]);
    const recordingKeystrokes = useRef(false);
    const currentKeypressHandler = useRef<KeypressParser | undefined>(undefined);
    const keypressTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const isScanning = useRef<boolean>(true);
    const keypressHandlers = useMemo<KeypressParser[]>(() => [
        {
            startKey: "{",
            endKey: "}",
            onComplete: onEventPassScan,
            timeout: 2000
        }
    ], [onEventPassScan]);

    // QR
    const qr = useRef<Html5Qrcode>();

    // Audio
    const ding = useRef<HTMLAudioElement>();

    // State
    const [ scannerStatus, setScannerStatus ] = useState<ScannerStatus>("scanning");
    const [ checkedInMemberName, setCheckedInMemberName ] = useState("");
    const [ errorString, setErrorString ] = useState("");

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
            let handler = keypressHandlers.find(h => h.startKey == key)

            // If we find a suitable handler, start recording keystrokes.
            if (handler) {
                console.log("Starting handler...")
                keystrokes.current = [key]
                currentKeypressHandler.current = handler
                keypressTimeout.current = setTimeout(() => {
                    console.log("Keypress handler timeout")
                    keypressTimeout.current = undefined
                    currentKeypressHandler.current = undefined
                }, handler.timeout)
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

    function onEventPassScan(text: string) {
        const eventPassObj = JSON.parse(text);
        const issuanceId = eventPassObj.issuanceId;
        if (issuanceId) {
            isScanning.current = false;
            setScannerStatus("processing");
            resolve("eventPass", issuanceId).then(result => {
                if (result.member) {
                    setCheckedInMemberName(result.member.name);
                } else {
                    setErrorString(result.error!);
                }

                showResultStatus(result.member ? result.member.type : "error");
            })
        }
    }

    function onQRScan(text: string, result: Html5QrcodeResult) {
        // Only allow 
        if (result.result.format?.format == Html5QrcodeSupportedFormats.AZTEC && isScanning.current) {
            onEventPassScan(text);
        }
    }

    function onQRError(err: string) {

    }

    function onSwipe(cardId: string) {
        // showResultStatus("found");
    }

    function showResultStatus(status: ScannerStatus) {
        setScannerStatus(status);
        ding.current?.play();

        setTimeout(() => {
            setScannerStatus("scanning");
            isScanning.current = true;
        }, config?.statusDisplayTime)
    }

    useEffect(() => {
        // Process key presses for handling a swipe login.
        document.addEventListener("keypress", newKeypressHandler);

        // Create the QR code scanner
        // configureQRScanner();

        // Get "ding" sound
        ding.current = new Audio("/frontend/static/sound/ding.mp3");

        return () => {
            document.removeEventListener("keypress", newKeypressHandler);
            if (qr.current) {
                qr.current.stop();
            }
        }
    }, [])

    return <div className="scanner-bar" style={{backgroundColor: STATUS_COLOR}}>
        <div className="scanner-content">
            <div className="scanner-status-bg" >
                <h4>{STATUS_TITLE}</h4>
                <div className="scanner-status-icon">
                    <STATUS_ICON />
                </div>
            </div>
            <div className="scanner-text">
                <h5>{STATUS_DESCRIPTION}</h5>
            </div>
            {/* <div className="scanner-bg">
                <div id="scanner"/>
            </div> */}
        </div>
    </div>
}