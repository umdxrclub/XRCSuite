import { Lab } from "payload/generated-types";
import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { XRCStatusMessage } from "../../ws/XRCStatus";

type XRCStatus = {
  lab?: Lab;
};

const XRCStatusContext = React.createContext<XRCStatus>({
  lab: undefined,
});

type XRCStatusProviderProps = {
  children?: React.ReactNode;
};

export function useXRCStatus() {
  return useContext(XRCStatusContext);
}

const XRCStatusProvider: React.FC<XRCStatusProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<XRCStatus>({
    lab: undefined,
  });
  const wsRef = useRef<WebSocket>();

  const onNewMessage = useCallback((msgEvent: MessageEvent) => {
    console.log("XRCStatus msg: " + msgEvent.data);
    const msg = JSON.parse(msgEvent.data) as XRCStatusMessage;

    if (msg.type == "labUpdate") {
      fetchLab();
    }
  }, []);

  const createLabWs = useCallback(() => {
    var retry = () => {
        setTimeout(createLabWs, 5000);
    }

    // Create Web Socket
    const wsProtocol = location.protocol.replace("http", "ws");
    const wsUrl = `${wsProtocol}//${window.location.host}/api/status`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = onNewMessage;
    ws.onerror = retry;
    ws.onclose = retry;
    wsRef.current = ws;
  }, [])

  const fetchLab = useCallback(() => {
    fetch("/api/globals/lab")
      .then((r) => r.json())
      .then((j) =>
        setStatus((s) => ({
          ...s,
          lab: j,
        }))
      );
  }, []);

  useEffect(() => {
    // Get lab status
    fetchLab();

    createLabWs();
  }, []);

  return (
    <XRCStatusContext.Provider value={status}>
      {children}
    </XRCStatusContext.Provider>
  );
};

export default XRCStatusProvider;
