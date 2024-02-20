import { Stack, Typography } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import CarouselLoader from "../../carousel/CarouselLoader";
import { RobotoLink } from "../../util/RobotoLink";
import { Gatekeeper, GatekeeperResolver } from "../scanners/Gatekeeper";
import CompactScanner from "../scanners/compact/CompactScanner";
import LabStatus from "./LabStatus";
import "./lab-gatekeeper.css";
import { useXRCStatus } from "../../providers/XRCStatusProvider";
import { getDocumentId } from "@xrclub/club.js/dist/payload/payload-util";

function getDateText(): DateText {
  let now = moment();
  return {
    date: now.format("dddd MMM D"),
    time: now.format("h:mm A"),
  };
}

type DateText = {
  time: string;
  date: string;
};

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
  const [time, setCurrentTime] = useState<DateText>(getDateText());
  const status = useXRCStatus();

  useEffect(() => {
    // Show clock time
    let clockInterval = setInterval(() => {
      setCurrentTime(getDateText());
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
            <LabStatus />
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <div className="roboto-medium lab-date">{time.date}</div>
              <div className="roboto-bold lab-time">{time.time}</div>
            </Stack>

            <CompactScanner />
          </div>
          <div className="lab-info">
            {status.lab?.carousel ? (
              <CarouselLoader
                carouselId={getDocumentId(status.lab?.carousel)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Gatekeeper>
  );
};
