import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from "react";
import {
  LabMediaType,
  ResolveMethod,
  ResolveResult,
} from "../../../types/XRCTypes";
import { ResolveDialog } from "./ResolveDialog";

export type GatekeeperStatus = "off" | "scanning" | "processing";
export type GatekeeperResultStatus =
  | GatekeeperStatus
  | "checkin"
  | "checkout"
  | "error";

export type GatekeeperResolver = (
  method: ResolveMethod,
  value: string
) => Promise<ResolveResult>;

type GatekeeperProps = {
  resolver: GatekeeperResolver;
  children?: React.ReactNode;
};

type KeypressParser = {
  key: string;
  endKey?: string;
  onComplete: (value: string) => void;
  timeout?: number;
  includeDelimiters?: boolean;
};

export type GatekeeperState = {
  status: GatekeeperStatus;
  result?: ResolveResult;
};

const GatekeeperContext = createContext<GatekeeperState>({
  status: "off",
});

export function useGatekeeperContext() {
  return useContext(GatekeeperContext);
}

export function useGatekeeperResultStatus(
  showResultTime: number
): GatekeeperResultStatus {
  let gatekeeper = useGatekeeperContext();
  let prevGatekeeperStatus = useRef<GatekeeperStatus>("off");
  let [resultStatus, setResultStatus] = useState<GatekeeperResultStatus>("off");

  function showResultStatus(status: GatekeeperResultStatus) {
    setResultStatus(status);

    let mediaType: LabMediaType =
      status == "error" ? "reject-sound" : "accept-sound";

    let sound = new Audio("/api/globals/lab/media/" + mediaType);
    sound
      .play()
      .then(() => sound.remove())
      .catch(() => console.error("Couldn't play check-in/out sound!"));

    setTimeout(() => {
      setResultStatus(gatekeeper.status);
    }, showResultTime);
  }

  useEffect(() => {
    let currentStatus = gatekeeper.status;
    let prevStatus = prevGatekeeperStatus.current;
    if (currentStatus == prevStatus) return;

    var newStatus: GatekeeperResultStatus = gatekeeper.status;
    let result = gatekeeper.result;
    if (currentStatus == "scanning" && prevStatus == "processing") {
      if (result?.member) {
        newStatus = result.member.type;
      } else if (result?.error) {
        newStatus = "error";
      }

      showResultStatus(newStatus);
    } else {
      setResultStatus(newStatus);
    }

    prevGatekeeperStatus.current = gatekeeper.status;
  }, [gatekeeper]);

  return resultStatus;
}

export function isResultStatus(resultStatus: GatekeeperResultStatus) {
  return resultStatus == "checkin" ||
  resultStatus == "checkout" ||
  resultStatus == "error"
}

export const Gatekeeper: React.FC<GatekeeperProps> = ({
  resolver,
  children,
}) => {
  // Swipe card
  const keystrokes = useRef<string[]>([]);
  const currentKeypressHandler = useRef<KeypressParser | undefined>(undefined);
  const keypressTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const isScanning = useRef<boolean>(true);
  const keypressHandlers = useMemo<KeypressParser[]>(
    () => [
      {
        key: "{",
        endKey: "}",
        onComplete: onEventPassScan,
        timeout: 2000,
      },
      {
        key: "A",
        endKey: "B",
        timeout: 2000,
        onComplete: onSwipe,
        includeDelimiters: false,
      },
      {
        key: "`",
        onComplete: () => setResolveDialogOpen(true),
      },
    ],
    [onEventPassScan]
  );

  const resolve = async (method: ResolveMethod, value: string) => {
    isScanning.current = false;
    setScannerStatus("processing");
    let result = await resolver(method, value);
    setResult(result);
    setScannerStatus("scanning");
  };

  // State
  const [scannerStatus, setScannerStatus] =
    useState<GatekeeperStatus>("scanning");
  const [result, setResult] = useState<ResolveResult | undefined>(undefined);
  const [resolveDialogOpen, setResolveDialogOpen] = useState<boolean>(false);

  function newKeypressHandler(e: KeyboardEvent) {
    const key = e.key;
    if (!currentKeypressHandler.current) {
      let handler = keypressHandlers.find((h) => h.key == key);

      // If we find a suitable handler, start recording keystrokes.
      if (handler) {
        if (handler.endKey) {
          console.log("Starting handler...");
          keystrokes.current = [key];
          currentKeypressHandler.current = handler;
          keypressTimeout.current = setTimeout(() => {
            console.log("Keypress handler timeout");
            keypressTimeout.current = undefined;
            currentKeypressHandler.current = undefined;
          }, handler.timeout);
        } else {
          // If there's no end key, then just call on complete
          // immediately.

          handler.onComplete(key);
        }
      }
    } else {
      let handler = currentKeypressHandler.current;
      // Add key press to strokes array.
      keystrokes.current.push(key);

      if (key == handler.endKey) {
        // Keystrokes complete, handle result.
        console.log("Ending handler...");
        let keystrokeString = keystrokes.current.join("");
        console.log("Parsed keystroke string: " + keystrokeString);
        if (!(handler.includeDelimiters ?? true)) {
          let startIndex = handler.key.length;
          let endIndex =
            keystrokeString.length - handler.endKey?.length ?? 0 - startIndex;
          keystrokeString = keystrokeString.slice(startIndex, endIndex);
        }

        handler.onComplete(keystrokeString);

        // Reset for next handler
        keystrokes.current = [];
        currentKeypressHandler.current = undefined;
        clearTimeout(keypressTimeout.current);
        keypressTimeout.current = undefined;
      }
    }
  }

  function onEventPassScan(text: string) {
    const eventPassObj = JSON.parse(text);
    const issuanceId = eventPassObj.issuanceId;
    if (issuanceId) {
      resolve("terplink", issuanceId);
    }
  }

  function onSwipe(cardId: string) {
    resolve("card", cardId);
  }

  useEffect(() => {
    // Process key presses for handling a swipe login.
    document.addEventListener("keypress", newKeypressHandler);

    return () => {
      document.removeEventListener("keypress", newKeypressHandler);
    };
  }, []);

  return (
    <>
      <ResolveDialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        submitResolve={resolve}
      />
      <GatekeeperContext.Provider
        value={{
          status: scannerStatus,
          result,
        }}
      >
        {children}
      </GatekeeperContext.Provider>
    </>
  );
};
