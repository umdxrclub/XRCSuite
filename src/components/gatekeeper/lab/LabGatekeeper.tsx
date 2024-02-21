import React from "react";
import { Gatekeeper, GatekeeperResolver } from "../scanners/Gatekeeper";
import CompactScanner from "../scanners/compact/CompactScanner";
import LabDashboard from "../../lab/LabDashboard";

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
  return (
    <Gatekeeper resolver={XRLabResolver}>
      <LabDashboard>
        <CompactScanner />
      </LabDashboard>
    </Gatekeeper>
  );
};
