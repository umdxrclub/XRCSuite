import React, { useEffect, useState } from "react";
import {
  GatekeeperResultStatus,
  GatekeeperState,
  isResultStatus,
  useGatekeeperContext,
  useGatekeeperResultStatus,
} from "../Gatekeeper";
import ErrorSVG from "../error.svg";
import ExitSVG from "../exit-run.svg";
import HandWaveSVG from "../hand-wave.svg";
import "./compact-scanner-result.css";

function resultStatusToClass(resultStatus: GatekeeperResultStatus) {
  var className: string = "";
  switch (resultStatus) {
    case "checkin":
    case "checkout":
      className = "compact-scanner-result-success";
      break;

    case "error":
      className = "compact-scanner-result-error";
      break;

    case "processing":
      className = "compact-scanner-result-processing";
      break;
  }

  return className;
}

function resultStatusToIcon(resultStatus: GatekeeperResultStatus) {
  var imgSrc: string | undefined = undefined;
  switch (resultStatus) {
    case "checkin":
      imgSrc = HandWaveSVG;
      break;
    case "checkout":
      imgSrc = ExitSVG;
      break;

    case "error":
      imgSrc = ErrorSVG;
      break;
  }

  return imgSrc;
}

type CompactScannerResultProps = {};

const CompactScannerResult: React.FC<CompactScannerResultProps> = ({}) => {
  let gatekeeper = useGatekeeperContext();
  let resultStatus = useGatekeeperResultStatus(10000);
  let [result, setResult] = useState<
    { resultStatus: GatekeeperResultStatus; state: GatekeeperState; text: string } | undefined
  >();

  useEffect(() => {
    if (isResultStatus(resultStatus)) {
      var newText = "";
      if (resultStatus == "checkin") {
        newText = `Welcome,\n${gatekeeper.result?.member?.name}!`;
      } else if (resultStatus == "checkout") {
        newText = `See you later,\n${gatekeeper.result?.member?.name}!`;
      } else if (resultStatus == "error") {
        newText = `You could not be checked in!\n${gatekeeper.result?.error}`;
      }

      setResult({
        resultStatus,
        state: gatekeeper,
        text: newText
      });
    }
  }, [resultStatus]);

  return (
    <div
      className={`compact-scanner-result ${
        isResultStatus(resultStatus) ? "compact-scanner-result-showing" : ""
      }`}
    >
      <div
        className={`compact-scanner-result-content ${resultStatusToClass(
          result?.resultStatus ?? "off"
        )}`}
      >
        <img
          className="compact-scanner-result-icon"
          src={resultStatusToIcon(result?.resultStatus ?? "off")}
        />
        {result?.text}
      </div>
    </div>
  );
};

export default CompactScannerResult;
