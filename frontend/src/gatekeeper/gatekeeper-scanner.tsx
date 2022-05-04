import React, { useEffect, useRef, useState } from "react";
import { XRCSchema } from "xrc-schema"
import { ReactComponent as ProceedSVG } from "./proceed.svg";
import { ReactComponent as ProcessingSVG } from "./processing.svg";
import { ReactComponent as StopSVG } from "./stop.svg";
import { Html5Qrcode } from "html5-qrcode";
import { Html5QrcodeCameraScanConfig } from "html5-qrcode/esm/html5-qrcode";
import { Html5QrcodeResult, Html5QrcodeSupportedFormats, QrcodeResultFormat } from "html5-qrcode/esm/core";
import { Paper, Typography } from "@mui/material";
import "./gatekeeper-scanner.css";
import { getXRC } from "../xrc-api";

const QR_SCANNER_CONFIG: Html5QrcodeCameraScanConfig = {
    fps: 5,
}

type ScannerStatus = "scanning" | "processing" | "found" | "error";
type ScannerConfig = {
    colors: Record<ScannerStatus, string>,
    titles: Record<ScannerStatus, string>,
    descriptions: Record<ScannerStatus, string>,
    icons: Record<ScannerStatus, React.FunctionComponent<React.SVGProps<SVGSVGElement>>>,
    statusDisplayTime: number
}

type ScanMethodType = "terplink" | "swipecard";
export type GatekeeperResolver = (method: ScanMethodType, value: string) => Promise<string | null>

export const DefaultScannerConfig: ScannerConfig = {
    colors: {
        found: "#54B845",
        processing: "#DCAC13",
        scanning: "#E61A31",
        error: "red",
    },

    titles: {
        found: "PROCEED",
        processing: "STANDBY",
        scanning: "STOP",
        error: "ERROR",
    },

    descriptions: {
        found: "Welcome, {NAME}!",
        processing: "Hang tight! We are currently checking you in.",
        scanning: "Please scan your event pass before proceeding.",
        error: "Something went wrong. Please try again or find a XR Club staff member.",
    },

    icons: {
        found: ProceedSVG,
        processing: ProcessingSVG,
        error: StopSVG,
        scanning: StopSVG,
    },

    statusDisplayTime: 2 * 1000
}

type GatekeeperScannerProps = {
    resolve: GatekeeperResolver
    config?: ScannerConfig
}

const SWIPECARD_TRACK_LENGTH = 15
const SWIPECARD_TIMEOUT = 1000;

export const GatekeeperScanner: React.FC<GatekeeperScannerProps> = ({config, resolve}) => {
    // Swipe card
    const keystrokes = useRef<string[]>([]);
    const recordingKeystrokes = useRef(false);
    const swipeTimeout = useRef<NodeJS.Timeout | null>(null);

    // QR
    const qr = useRef<Html5Qrcode>();

    // Audio
    const ding = useRef<HTMLAudioElement>();

    // State
    const [ scannerStatus, setScannerStatus ] = useState<ScannerStatus>("scanning");
    const [ checkedInMemberName, setCheckedInMemberName ] = useState("");

    // Load default scanner config if one wasn't provided.
    config ??= DefaultScannerConfig;

    // Current scanner status metadata.
    const STATUS_TITLE = config!.titles[scannerStatus];
    const STATUS_COLOR = config!.colors[scannerStatus];
    const STATUS_ICON = config!.icons[scannerStatus];
    const STATUS_DESCRIPTION = config!.descriptions[scannerStatus].replace("{NAME}", checkedInMemberName);

    /**
     * Processes the key presses from the document to search for the output of a
     * magnetic card scanner. This allows for the use of UMD ID's for signing in.
     */
    function keypressHandler(e: KeyboardEvent) {
        const key = e.key;
        if (!recordingKeystrokes.current) {
            // The ";" indicates the start of a Track 1 sequence on a
            // magnetic swipe card.
            if (key == ";") {
                recordingKeystrokes.current = true;
                keystrokes.current = [];

                // Set a timeout to stop recording keystrokes if the card
                // wasn't scanned in time.
                swipeTimeout.current = setTimeout(() => {
                    if (recordingKeystrokes.current) {
                        recordingKeystrokes.current = false;
                        console.warn("Can't process card swipe: swipe took too long.");
                    }
                    // Reset timeout.
                    swipeTimeout.current = null;
                }, SWIPECARD_TIMEOUT)
            }
        } else {
            // The "?" indicates the end of a track sequence on a magnetic
            // swipe card.
            if (key == "?") {
                // Join all the individual key presses to get the entire card id.
                const cardId = keystrokes.current.join("");
                recordingKeystrokes.current = false;

                // Send the card ID to the swipe handler.
                onSwipe(cardId);
            } else if (keystrokes.current.length > SWIPECARD_TRACK_LENGTH) {
                // Track is too long, so it is not a valid swipe card number.
                // Therefore, stop recording keystrokes.
                recordingKeystrokes.current = false;
                console.warn("Can't process card swipe: track is too long!");
            } else {
                keystrokes.current.push(key);
            } 
        }
    }

    function configureQRScanner() {
        qr.current = new Html5Qrcode("scanner");
        qr.current!.start({ facingMode: "user"}, QR_SCANNER_CONFIG, onQRScan, onQRError);
    }

    function onQRScan(text: string, result: Html5QrcodeResult) {
        // Only allow 
        if (result.result.format?.format == Html5QrcodeSupportedFormats.AZTEC && scannerStatus == "scanning") {
            const eventPassObj = JSON.parse(text);
            const issuanceId = eventPassObj.issuanceId;
            if (issuanceId) {
                setScannerStatus("processing");
                resolve("terplink", issuanceId).then(name => {
                    if (name) {
                        setCheckedInMemberName(name);
                    }

                    showResultStatus(name ? "found" : "error");
                })
            }
        }
    }

    function onQRError(err: string) {

    }

    function onSwipe(cardId: string) {
        showResultStatus("found");
    }

    function showResultStatus(status: ScannerStatus) {
        setScannerStatus(status);
        ding.current?.play();

        setTimeout(() => {
            setScannerStatus("scanning");
        }, config?.statusDisplayTime)
    }

    useEffect(() => {
        // Process key presses for handling a swipe login.
        document.addEventListener("keypress", keypressHandler);

        // Create the QR code scanner
        configureQRScanner();

        // Get "ding" sound
        ding.current = new Audio("/frontend/static/sound/ding.mp3");

        return () => {
            document.removeEventListener("keypress", keypressHandler);
            if (qr.current) {
                qr.current.stop();
            }
        }
    }, [])

    return <Paper className="scanner-paper" sx={{backgroundColor: STATUS_COLOR}}>
        <div className="scanner-status-bg" >
            <Typography variant="h4" fontWeight="bold">{STATUS_TITLE}</Typography>
            <STATUS_ICON />
        </div>
        <div id="scanner"/>
        <div className="scanner-text">
            <Typography variant="h5">{STATUS_DESCRIPTION}</Typography>
        </div>
    </Paper>
}