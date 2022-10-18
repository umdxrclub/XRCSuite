import { XRCSchema } from "@xrc/XRCSchema";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GatekeeperResolver, GatekeeperScanner } from "./gatekeeper-scanner";
import "./event-gatekeeper.css";
import terplinkCode from "./terplink.png";

export const EventGatekeeper: React.FC = ({ children }) => {
  const { eventcode } = useParams();

  useEffect(() => {

  }, []);

  let resolver: GatekeeperResolver = useCallback(async (method, value) => {
    if (method == "eventPass") {
      try {
        var res = await fetch(`https://umdxrc.figsware.net/api/v1/events/checkin?tlIssuanceId=${value}&tlEventCode=${eventcode}`, {
          method: "POST"
        })
      } catch {
        return {
          error: "Could not connect to server!"
        };
      }
      
      let j = await res.json() as XRCSchema.Response<XRCSchema.LabCheckInResult>
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
  }, []);

  return (
    <div className="event-gk-root">
      <div className="gk-event">
        <div className="gk-terplink">
          <p>
            Scan the following QR Code to access your TerpLink event pass.
          </p>
          <img id="terplink-qr" src={terplinkCode} />
        </div>
      </div>
      <GatekeeperScanner resolve={ resolver }/>
    </div>
  );
};
