import React, { useState } from "react";
import { TerpLinkScanner } from "./terplink-scanner";
import "./lab-gatekeeper.css"
import { Modal, Typography } from "@mui/material";
import { XRClubLogo } from "../core/xr-club-logo";
import { LabScanner } from "./lab-scanner";

export const LabGatekeeper: React.FC = ({ children }) => {

  return <div className="lab-gk-root">
    <div className="lab-header">
      <XRClubLogo style={{width: 125}} />
      <Typography id="lab-title" variant="h3" fontWeight={"bold"}>
      Welcome to the XR Club Lab!
      </Typography>
    </div>
    <LabScanner />
  </div>
};
