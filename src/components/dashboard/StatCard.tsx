import { Card } from "payload/components/elements";
import React from "react";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import RemoveIcon from "@mui/icons-material/Remove";

type StatChange = "up" | "down" | "none" | undefined;

type StatCardProps = {
  title: string;
  data: string | number | undefined;
  change?: StatChange;
};

const PositiveChangeColor = "#52ab37";
const NegativeChangeColor = "#e64747";

function getChangeElement(change: StatChange) {
  switch (change) {
    case "up":
      return <ArrowDropUpIcon htmlColor={PositiveChangeColor} />;
    case "none":
      return <RemoveIcon />;
    case "down":
      return <ArrowDropDownIcon htmlColor={NegativeChangeColor} />;
    default:
      return null;
  }
}

const StatCard: React.FC<StatCardProps> = ({ title, data, change }) => {
  return (
    <Card
      title={title}
      actions={
        <React.Fragment>
          <b>
            <p style={{ fontSize: 25, flex: 1, margin: 0 }}>{data ?? "--"}</p>
          </b>
          {getChangeElement(change)}
        </React.Fragment>
      }
    />
  );
};

export default StatCard;
