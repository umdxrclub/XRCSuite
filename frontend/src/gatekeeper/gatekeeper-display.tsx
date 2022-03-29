import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Html5QrcodeResult,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode/esm/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getXRC } from "../xrc-api";
import "./gatekeeper-display.css";
import { ReactComponent as ProceedSVG } from "./proceed.svg";
import { ReactComponent as ProcessingSVG } from "./processing.svg";
import { ReactComponent as StopSVG } from "./stop.svg";
import terplinkCode from "./terplink.png";

type GatekeeperStatus = "scanning" | "processing" | "found" | "error";

const STATUS_COLORS: Record<GatekeeperStatus, string> = {
  found: "#54B845",
  processing: "#DCAC13",
  scanning: "#E61A31",
  error: "red",
};

const STATUS_TEXT: Record<GatekeeperStatus, string> = {
  found: "PROCEED",
  processing: "STANDBY",
  scanning: "STOP",
  error: "ERROR",
};

const STATUS_DESCRIPTION: Record<GatekeeperStatus, string> = {
  found: "Welcome, {NAME}!",
  processing: "Hang tight! We are currently checking you in.",
  scanning: "Please scan your event pass before proceeding.",
  error:
    "Something went wrong. Please try again or find a XR Club staff member.",
};

const STATUS_SVG: Record<
  GatekeeperStatus,
  React.FunctionComponent<React.SVGProps<SVGSVGElement>>
> = {
  found: ProceedSVG,
  processing: ProcessingSVG,
  error: StopSVG,
  scanning: StopSVG,
};

/**
 * Time to show the proceed status before scanning again.
 */
const DISPLAY_DELAY = 4 * 1000;

export const GatekeeperDisplay: React.FC = ({ children }) => {
  const { eventcode } = useParams();

  const scanner = useRef<Html5QrcodeScanner>();
  const ding = useRef<HTMLAudioElement>();
  const [status, setStatus] = useState<{
    status: GatekeeperStatus;
    text: string;
  }>({ status: "scanning", text: STATUS_DESCRIPTION["scanning"] });
  const [eventName, setEventName] = useState<string>("Event Name");
  const [eventTimeframe, setEventTimeframe] = useState<string>("Event Title");
  const statusColor = STATUS_COLORS[status.status];
  const StatusSVG = STATUS_SVG[status.status];

  useEffect(() => {
    // Initialize QR Reader
    scanner.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
        formatsToSupport: [Html5QrcodeSupportedFormats.AZTEC],
      },
      false
    );

    scanner.current.render(success, error);
    ding.current = new Audio("/frontend/static/sound/ding.mp3");

    getXRC()
      .get("/terplink/:eventcode", {
        path: { eventcode: eventcode! },
      })
      .then((res) => {
        const event = res.data;
        const startDate = new Date(event.startDate);
        const dateText = startDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const timeText = startDate.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        });

        const startTimeText = `${dateText} - ${timeText}`;
        setEventName(event.name);
        setEventTimeframe(startTimeText);
      });
  }, []);

  /**
   * Pauses scanning for DISPLAY_DELAY time and then resumes scanning and
   * resets the scan status.
   */
  const showResult = useCallback(() => {
    setTimeout(() => {
      setStatus({
        status: "scanning",
        text: STATUS_DESCRIPTION["scanning"],
      });
      scanner.current?.resume();
    }, DISPLAY_DELAY);
  }, [setStatus]);

  /**
   * Called with a QR code has been successfully scanned.
   */
  const success = useCallback(
    async (text: string, result: Html5QrcodeResult) => {
      const code = JSON.parse(text);
      if (typeof code.issuanceId === "string") {
        // Stop scanning immediately to avoid duplicate requests.
        scanner.current?.pause();

        setStatus({
          status: "processing",
          text: STATUS_DESCRIPTION["processing"],
        });

        // Attempt to check the member in.
        try {
          const res = await getXRC().post("/terplink/:eventcode/checkin", {
            path: { eventcode: eventcode! },
            query: { instanceId: code.issuanceId },
          });
          const checkedInMember = res.data;

          if (ding.current) ding.current.play();

          setStatus({
            status: "found",
            text: STATUS_DESCRIPTION["found"].replace(
              "{NAME}",
              checkedInMember.name
            ),
          });
        } catch {
          setStatus({
            status: "error",
            text: STATUS_DESCRIPTION["error"],
          });
        }

        showResult();
      }
    },
    [setStatus]
  );

  const error = useCallback((e: any) => {}, []);

  return (
    <div className="gk-root">
      <div className="gk-event">
        <div className="clublogo-parent">
          <img id="clubLogo" src="/frontend/static/img/clublogo.png" />
        </div>
        <div className="event-text">
          <h1>{eventName}</h1>
          <h3>{eventTimeframe}</h3>
        </div>
        <div className="spacer" />
        <div className="gk-terplink">
          <p>
            Don't have a TerpLink event pass?
            <br />
            Scan the following QR Code to create one (it's free!).
          </p>
          <img id="terplink-qr" src={terplinkCode} />
        </div>
      </div>
      <div className="gk-scanner-parent">
        <div className="gk-scanner" style={{ backgroundColor: statusColor }}>
          <h1 id="status">{STATUS_TEXT[status.status]}</h1>
          <StatusSVG />
          <div id="qr-reader" />
          <div className="spacer" />
          <p>{status.text}</p>
        </div>
      </div>
    </div>
  );
};
