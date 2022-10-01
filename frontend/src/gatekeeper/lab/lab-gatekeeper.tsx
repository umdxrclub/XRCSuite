import React from "react";
import { GradientCard } from "util/GradientCard";
import { GatekeeperScanner } from "../gatekeeper-scanner";
import "./lab-gatekeeper.css";
import NoFoodImage from "./no-food.png";

export const LabGatekeeper: React.FC = ({ children }) => {

  return <div className="lab-gk-root">
    <div className="lab-info">
      <div className="lab-header">
        <h2>Welcome to the</h2>
        <h1>XR LAB</h1>
      </div>
      <div className="lab-rules">
        <h3>Remember that:</h3>
        <div className="lab-rules-group">
          <GradientCard>
            <p>You <u>must</u> be a club member AND sign our agreement.</p>
          </GradientCard>
          <GradientCard>
            <img src={NoFoodImage} />
            <p>No food or drink is allowed in the lab.</p>
          </GradientCard>
          <GradientCard>
            <p>This lab is under 24/7 video surveillance.</p>
          </GradientCard>
        </div>
      </div>
    </div>
    <GatekeeperScanner resolve={ async (method, value) => null } />
  </div>
};
