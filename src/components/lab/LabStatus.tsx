import React from "react";
import { useXRCStatus } from "../providers/XRCStatusProvider";
import "./lab-status.css";

type LabStatusProps = {};



const LabStatus: React.FC<LabStatusProps> = ({}) => {
  const status = useXRCStatus();

  return (
    <div className="lab-status">
      <h1 className={`lab-text ${status.lab?.open ? "lab-text-open" : ""}`}>
        XR LAB
      </h1>
      <div className="roboto-black lab-status-stat">
        {status.lab?.members?.length ?? "--"}
        <div className="roboto-medium lab-status-stat-header">CHECKED IN</div>
      </div>
    </div>
  );
};

export default LabStatus;
