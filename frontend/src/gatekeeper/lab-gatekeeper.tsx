import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Html5QrcodeResult,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode/esm/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { XRCSchema } from "xrc-schema";
import { getXRC } from "../xrc-api";
import { GatekeeperScanner } from "./gatekeeper-scanner";
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

export const LabGatekeeper: React.FC = ({ children }) => {
    return <div>
      <GatekeeperScanner />
    </div>
};
