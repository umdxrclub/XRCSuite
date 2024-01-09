import { Typography } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { RobotoLink } from "../../util/RobotoLink";
import ColumnScanner from "../scanners/column/ColumnScanner";
import { Gatekeeper, GatekeeperResolver } from "../scanners/Gatekeeper";
import "./lab-gatekeeper.css";
import CompactScanner from "../scanners/compact/CompactScanner";
import Carousel from "../../carousel/Carousel";
import CarouselOverlay from "../../carousel/CarouselOverlay";
import CarouselLoader from "../../carousel/CarouselLoader";

function getCurrentTimeString(): string {
  return moment().format("h:mm A");
}

const XRLabResolver: GatekeeperResolver = async (method, value) => {
  var checkInURL = new URL("/api/globals/lab/checkin", window.location.origin);
  checkInURL.searchParams.set("m", method);
  checkInURL.searchParams.set("v", value);
  try {
    var res = await fetch(checkInURL, {
      method: "POST",
    });
  } catch {
    return {
      error: "Could not connect to server!",
    };
  }

  let j = await res.json();
  if (j.error) {
    return {
      error: j.error,
    };
  } else {
    var checkInType: "checkin" | "checkout";

    if (j.type == "in") {
      checkInType = "checkin";
    } else {
      checkInType = "checkout";
    }

    return {
      error: undefined,
      member: {
        name: j.name,
        type: checkInType,
      },
    };
  }
};

export const LabGatekeeper: React.FC = ({}) => {
  const [time, setCurrentTime] = useState<string>(getCurrentTimeString());
  const [labOpen, setLabOpen] = useState<boolean>(false);
  const [memberCount, setMemberCount] = useState<number>(1);

  useEffect(() => {
    // Show clock time
    let clockInterval = setInterval(() => {
      setCurrentTime(getCurrentTimeString);
    }, 1000);

    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <Gatekeeper resolver={XRLabResolver}>
      <div className="lab-gk-root">
        <RobotoLink />
        <div className="lab-screen">
          <div className="lab-header">
            <h1 className="lab-cool-text">XR LAB</h1>
            <CompactScanner />
            <Typography variant="h1" fontWeight={"bold"}>
              {time}
            </Typography>
          </div>
          <div className="lab-info">
            <CarouselLoader carouselId="659c5874994707cafd544d2c" interval={10000}/>
          </div>
        </div>
      </div>
    </Gatekeeper>
  );
};
