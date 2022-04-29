import React from "react";
import { GatekeeperScanner } from "./gatekeeper-scanner";

export const LabGatekeeper: React.FC = ({ children }) => {
    return <div>
      <GatekeeperScanner onMemberResolve={(member) => {
        if (member) {
          
        }
      }} />
    </div>
};
