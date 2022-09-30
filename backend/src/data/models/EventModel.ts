import { XRCSchema } from "@xrc/XRCSchema"
import { DATE, INTEGER, STRING } from "sequelize";
import { AttendanceModel } from "./AttendanceModel";
import ModelFactory, { createColumn, XRCModel } from "./ModelFactory";

export class EventModel extends XRCModel<XRCSchema.Event, XRCSchema.Event> {

}

export const EventModelFactory: ModelFactory = {
    initModel: (sequelize) => {
        EventModel.init(
            {
                id: {
                    primaryKey: true,
                    type: INTEGER,
                    autoIncrement: true
                },
                terplinkEventId: createColumn(INTEGER, true, "terplink_event_id", true),
                discordEventId: createColumn(STRING, true, "discord_event_id", true),
                terplinkEventCode: createColumn(STRING, true, "terplink_event_code", true),
                name: createColumn(STRING, false, "name"),
                startDate: createColumn(DATE, true, "start_date"),
                endDate: createColumn(DATE, true, "end_date")

            },
            {
                tableName: "events",
                sequelize: sequelize
            }
        )
    },

    associate: () => {
        EventModel.hasMany(AttendanceModel, { foreignKey: "event_id", onDelete: "CASCADE"})
    }
}