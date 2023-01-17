import moment from "moment";
import React, { useEffect, useState } from "react";
import { GradientCard } from "../../util/GradientCard";
import { RobotoLink } from "../../util/RobotoLink";
import { GatekeeperScanner } from "../scanner/gatekeeper-scanner";
import ContractSVG from "./contract-svgrepo-com.svg";
import "./lab-gatekeeper.css";
import NoFoodImage from "./no-food.png";
import SecurityCameraSVG from "./security-camera-svgrepo-com.svg";

function getCurrentTimeString(): string {
  return moment().format("h:mm A");
}

export const LabGatekeeper: React.FC = ({ }) => {
  const [ time, setCurrentTime ] = useState<string>(getCurrentTimeString());


  useEffect(() => {
    // Show clock time
    let clockInterval = setInterval(() => {
      setCurrentTime(getCurrentTimeString)
    }, 1000);

    return () => {
      clearInterval(clockInterval);
    }
  }, [])


  return <div className="lab-gk-root">
    <RobotoLink />
    <div className="lab-info">
      <div className="lab-header">
        <div className="lab-welcome">
          <h2>Welcome to the</h2>
          <h1>XR LAB</h1>
        </div>
        <h1>{time}</h1>
      </div>
      <div className="lab-rules">
        <h3>Remember that:</h3>
        <div className="lab-rules-group">
          <GradientCard>
            <img src={ContractSVG} />
            <p>You <u>must</u> be a club member AND sign our agreement.</p>
          </GradientCard>
          <GradientCard>
            <img src={NoFoodImage} />
            <p>No food or drink is allowed in the lab.</p>
          </GradientCard>
          <GradientCard>
            <img src={SecurityCameraSVG} />
            <p>This lab is under 24/7 video surveillance.</p>
          </GradientCard>
        </div>
      </div>
    </div>
    <GatekeeperScanner resolve={ async (method, value) => {
      if (method == "terplink") {
        try {
          var res = await fetch(`https://umdxrc.figsware.net/api/v1/lab/checkin?tlIssuanceId=${value}&validateAgreement=0`, {
            method: "POST"
          })
        } catch {
          return {
            error: "Could not connect to server!"
          };
        }
        
        let j = await res.json()
        console.log(j)
        if (j.success) {
          return {
            error: undefined,
            member: j.data!
          }
        } else {
          return {
            error: j.error
          };
        }
      }
      return {
        error: "Failed to resolve member!"
      };
    } } />
  </div>
};
