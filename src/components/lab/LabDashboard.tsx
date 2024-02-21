import { Stack, Typography } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { getDocumentId } from "@xrclub/club.js/dist/payload/payload-util";
import { useXRCStatus } from "../providers/XRCStatusProvider";
import { RobotoLink } from "../util/RobotoLink";
import CarouselLoader from "../carousel/CarouselLoader";
import LabStatus from "./LabStatus";
import "./lab-dashboard.css";

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

type LabDashboardProps = {
  children?: React.ReactNode
}

const LabDashboard: React.FC<LabDashboardProps> = ({children}) => {
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
    <div className="lab-dashboard-root">
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
          {children}
        </div>
        <div className="lab-info">
          {status.lab?.carousel ? (
            <CarouselLoader carouselId={getDocumentId(status.lab?.carousel)} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;