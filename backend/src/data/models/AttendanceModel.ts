import { XRCSchema } from "@xrc/XRCSchema";
import { DATE, INTEGER } from "sequelize";
import ModelFactory, { createColumn, XRCModel } from "./ModelFactory";

export class AttendanceModel extends XRCModel<XRCSchema.Attendance, XRCSchema.Attendance> {}

export const AttendanceModelFactory: ModelFactory = {
    initModel: (sequelize) => {
        AttendanceModel.init(
            {
                id: {
                    primaryKey: true,
                    type: INTEGER,
                    autoIncrement: true
                },
                eventId: createColumn(INTEGER, false, "event_id"),
                memberId: createColumn(INTEGER, false, "member_id"),
                date: createColumn(DATE, false, "date"),
                type: createColumn(INTEGER, false, "type")
            },
            {
                tableName: "attendance",
                sequelize: sequelize
            }
        )
    }
}