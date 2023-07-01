import { Box, Typography } from "@mui/material";
import { Event } from "payload/generated-types";
import React, { useState, useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import { RobotoLink } from "../../util/RobotoLink";
import {
  GatekeeperResolver,
  GatekeeperScanner,
} from "../scanner/GatekeeperScanner";
import "./EventGatekeeper.css";

export const EventGatekeeper: React.FC = ({}) => {
  const match = useRouteMatch<{ id: string }>();
  const [event, setEvent] = useState<Event | undefined>();
  const eventId = match.params.id;

  useEffect(() => {
    fetch("/api/events/" + eventId).then(async (e) => {
      let parsed_event: Event = await e.json();
      setEvent(parsed_event);
    });
  }, [eventId]);

  const EventGatekeeperResolver: GatekeeperResolver = async (method, value) => {
    var checkInURL = new URL(
      "/api/events/" + eventId + "/checkin",
      window.location.origin
    );
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
      return j;
    }
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="row"
      id="event-gk-root"
    >
      <RobotoLink />
      <Box flex={4} display="flex">
        {event ? (
          <Box margin={4} flex={1}>
            <div
              style={{
                background: `url(${event.imageUrl})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "100%",
                height: "100%",
              }}
            ></div>
          </Box>
        ) : null}
      </Box>
      <GatekeeperScanner
        config={{ statusDisplayTime: 2000 }}
        resolver={EventGatekeeperResolver}
      />
    </Box>
  );
};
