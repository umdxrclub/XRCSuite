import { BOOLEAN, ENUM, INET, INTEGER, Model, NUMBER, Optional, STRING } from "sequelize";
import ModelFactory from "./ModelFactory";
import { MemberModel } from "./MemberModel";
import { XRCSchema } from "xrc-schema";
export class AttendanceModel extends Model<XRCSchema.AttendanceEvent, XRCSchema.AttendanceEvent> {
    declare id: number
    declare member_id: number
    declare type: "checkin" | "checkout"
    declare location: string
}

export const AttendanceModelFactory: ModelFactory = {
    initModel: (sequelize) => {
        AttendanceModel.init({
            id: {
                primaryKey: true,
                type: INTEGER,
                autoIncrement: true
            },

            member_id: {
                type: INTEGER,
                allowNull: false
            },

            type: {
                type: ENUM("checkin", "checkout")
            },

            location: {
                type: STRING
            }
        },
        {
            tableName: "attendance",
            sequelize: sequelize,
        });
    },

    associate: () => {
        AttendanceModel.belongsTo(MemberModel, {targetKey: "id", foreignKey: "member_id"});
    }
}