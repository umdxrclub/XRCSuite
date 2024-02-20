import React from "react";
import {
  GatekeeperResultStatus,
  useGatekeeperContext,
  useGatekeeperResultStatus,
} from "../Gatekeeper";
import "./compact-scanner.css";
import CompactScannerResult from "./CompactScannerResult";

function resultStatusToClass(resultStatus: GatekeeperResultStatus) {
  var className: string = "compact-scanner-off";
  switch (resultStatus) {
    case "checkin":
    case "checkout":
      className = "compact-scanner-success";
      break;

    case "error":
      className = "compact-scanner-error";
      break;

    case "processing":
      className = "compact-scanner-processing";
      break;

    case "scanning":
      className = "compact-scanner-scanning-pill";
      break;
  }

  return className;
}

function resultStatusToString(resultStatus: GatekeeperResultStatus) {
  var name: string = "READY TO SCAN";
  switch (resultStatus) {
    case "off":
      name = "DISABLED";
    case "processing":
      name = "PROCESSING";
      break;
  }

  return name;
}

const CompactScanner: React.FC = () => {
  let gatekeepr = useGatekeeperContext();
  return (
    <div className="compact-scanner-container">
      <div className={"compact-scanner compact-scanner-scanning-pill"}>
        <CompactScannerResult />
        {resultStatusToString(gatekeepr.status)}
      </div>
    </div>
  );
};

export default CompactScanner;
