import React, { useEffect, useRef } from "react";
import { XRCSchema } from "xrc-schema"
import { ReactComponent as ProceedSVG } from "./proceed.svg";
import { ReactComponent as ProcessingSVG } from "./processing.svg";
import { ReactComponent as StopSVG } from "./stop.svg";

type ScannerStatus = "scanning" | "processing" | "found" | "error";
type ScannerConfig = {
    colors: Record<ScannerStatus, string>,
    titles: Record<ScannerStatus, string>,
    descriptions: Record<ScannerStatus, string>,
    icons: Record<ScannerStatus, React.FunctionComponent<React.SVGProps<SVGSVGElement>>>,
    statusDisplayTime: number
}
type ScanResultHandler = (member: XRCSchema.Member) => void

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
    onScan?: ScanResultHandler
    config?: ScannerConfig
}

const SWIPECARD_TRACK_LENGTH = 15
const SWIPECARD_TIMEOUT = 1000;

export const GatekeeperScanner: React.FC<GatekeeperScannerProps> = ({config, onScan}) => {
    // Swipe card
    const keystrokes = useRef<string[]>([]);
    const recordingKeystrokes = useRef(false);
    const swipeTimeout = useRef<NodeJS.Timeout | null>(null);

    // Load default scanner config if one wasn't provided.
    config ??= DefaultScannerConfig;

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

    useEffect(() => {
        // Process key presses for handling a swipe login.
        document.addEventListener("keypress", keypressHandler);

        return () => {
            document.removeEventListener("keypress", keypressHandler);
        }
    }, [])

    function onSwipe(cardId: string) {
        setTimeout(() => alert("Your card id: " + cardId), 500);
    }

    return <div>

    </div>
}