import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import { GradientCard } from "../../../util/GradientCard";
import { GatekeeperResultStatus, useGatekeeperContext, useGatekeeperResultStatus } from "../Gatekeeper";
import ErrorSVG from "../error.svg";
import ProceedSVG from "../proceed.svg";
import ProcessingSVG from "../processing.svg";
import StopSVG from "../stop.svg";
import TerpLinkQRCode from "../terplink_qr.png";
import "./column-scanner.css";

type ColumnScannerConfig = {
  colors: Record<GatekeeperResultStatus, string | undefined>;
  titles: Record<GatekeeperResultStatus, string>;
  descriptions: Record<GatekeeperResultStatus, string>;
  icons: Record<GatekeeperResultStatus, string>;
  statusDisplayTime: number;
};

export const DefaultScannerConfig: ColumnScannerConfig = {
  colors: {
    off: "#111111",
    checkin: "#54B845",
    checkout: "#54B845",
    processing: "#DCAC13",
    scanning: undefined,
    error: "#E61A31",
  },

  titles: {
    off: "OFF",
    checkin: "PROCEED",
    checkout: "FAREWELL",
    processing: "STANDBY",
    scanning: "STOP",
    error: "ERROR",
  },

  descriptions: {
    off: "Not Scanning",
    checkin: "Welcome, {NAME}!",
    checkout: "See you later, {NAME}!",
    processing: "Hang tight! We are currently checking you in.",
    scanning: "Please scan your event pass before proceeding.",
    error: "{ERROR}",
  },

  icons: {
    off: ErrorSVG,
    checkin: ProceedSVG,
    checkout: ProceedSVG,
    processing: ProcessingSVG,
    error: ErrorSVG,
    scanning: StopSVG,
  },

  statusDisplayTime: 5 * 1000,
};

const ColumnScanner: React.FC = () => {
  let gatekeeper = useGatekeeperContext();
  let status = useGatekeeperResultStatus(5000);

  // Current scanner status metadata.
  const statusTitle = DefaultScannerConfig.titles[status];
  const statusColor = DefaultScannerConfig.colors[status];
  const statusIcon = DefaultScannerConfig.icons[status];
  const statusDescription = DefaultScannerConfig.descriptions[status]
    .replace("{NAME}", gatekeeper?.result?.member?.name ?? "")
    .replace("{ERROR}", gatekeeper.result?.error ?? "");

  return (
    <div className="scanner-bar">
      <GradientCard
        style={{
          backgroundColor: statusColor,
          height: "100%",
          background: statusColor,
          borderRadius: 0,
        }}
      >
        <Stack padding={2} spacing={2} height="100%">
          <Box>
            <Stack alignItems={"center"}>
              <Typography variant="h4" fontWeight="bold">
                {statusTitle}
              </Typography>
              <div className="scanner-status-icon">
                <img src={statusIcon} />
              </div>
            </Stack>
          </Box>

          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography fontSize={36}>{statusDescription}</Typography>
          </Box>

          <Stack alignItems="center" spacing={2}>
            <Typography variant="h5" fontSize={24}>
              Scan me to access your TerpLink event pass!
            </Typography>
            <img
              src={TerpLinkQRCode}
              style={{ borderRadius: 4, maxWidth: "60%" }}
            />
          </Stack>
        </Stack>
      </GradientCard>
    </div>
  );
};

export default ColumnScanner;
