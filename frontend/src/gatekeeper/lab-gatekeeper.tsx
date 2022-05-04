import React from "react";
import { TerpLinkScanner } from "./terplink-scanner";

export const LabGatekeeper: React.FC = ({ children }) => {
    return <div>
      <TerpLinkScanner eventcode="XE7M9EN" />
    </div>
};
