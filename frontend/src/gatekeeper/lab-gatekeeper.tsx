import React from "react";
import { TerpLinkScanner } from "./terplink-scanner";
import "./lab-gatekeeper.css"
import { Typography } from "@mui/material";

export const LabGatekeeper: React.FC = ({ children }) => {
    return <div className="gk-root">
      <Typography variant="h1" fontWeight={"bold"}>
        Welcome to the XR Club Lab!
      </Typography>
      <TerpLinkScanner eventcode="XE7M9EN" />
    </div>
};
