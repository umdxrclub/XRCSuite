import { Typography } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { GradientCard } from "../../util/GradientCard";
import { RobotoLink } from "../../util/RobotoLink";
import { GatekeeperResolver, GatekeeperScanner } from "../scanner/GatekeeperScanner";
import ContractSVG from "./contract-svgrepo-com.svg";
import "./lab-gatekeeper.css";
import NoFoodImage from "./no-food.png";
import SecurityCameraSVG from "./security-camera-svgrepo-com.svg";

function getCurrentTimeString(): string {
  return moment().format("h:mm A");
}

const XRLabResolver: GatekeeperResolver = async (method, value) => {
  console.log(method, value)
  var checkInURL = new URL('/api/globals/lab/checkin', window.location.origin)
  checkInURL.searchParams.set('m', method)
  checkInURL.searchParams.set('v', value)
  try {
    var res = await fetch(checkInURL, {
      method: "POST"
    })
  } catch {
    return {
      error: "Could not connect to server!"
    };
  }

  let j = await res.json()
  console.log(j)
  if (j.error) {
    return {
      error: j.error
    };
  } else {
    var checkInType: "checkin" | "checkout";

    if (j.type == "in") {
      checkInType = "checkin"
    } else {
      checkInType = "checkout"
    }

    return {
      error: undefined,
      member: {
        name: j.name,
        type: checkInType
      }
    }
  }
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
          <Typography fontWeight={"bold"} variant="h2">Welcome to the</Typography>
          <Typography variant="h1">XR LAB</Typography>
        </div>
        <Typography variant="h1">{time}</Typography>
      </div>
      <div className="lab-rules">
        <Typography variant="h3">Remember that:</Typography>
        <div className="lab-rules-group">
          <GradientCard>
            <img src={ContractSVG} />
            <Typography>You <u>must</u> be a club member AND sign our agreement.</Typography>
          </GradientCard>
          <GradientCard>
            <img src={NoFoodImage} />
            <Typography>No food or drink is allowed in the lab.</Typography>
          </GradientCard>
          <GradientCard>
            <img src={SecurityCameraSVG} />
            <Typography>This lab is under 24/7 video surveillance.</Typography>
          </GradientCard>
        </div>
      </div>
    </div>
    <GatekeeperScanner resolver={ XRLabResolver } />
  </div>
};
