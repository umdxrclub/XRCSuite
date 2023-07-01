import { BlockField } from "payload/types";
import Closing from "./schedules/Closing";
import Opening from "./schedules/Opening";

function createDayScheduleField(
  field: Omit<BlockField, "type" | "blocks">
): BlockField {
  return {
    ...field,
    type: "blocks",
    blocks: [Opening, Closing],
  };
}

export default createDayScheduleField;
