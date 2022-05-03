import { BOOLEAN, INTEGER, Model, NUMBER, Optional, STRING } from "sequelize";
import { XRCSchema } from "xrc-schema";
import ModelFactory from "./ModelFactory";
import { AttendanceModel } from "./AttendanceModel"


export type MemberCreationAttributes = Partial<XRCSchema.Member>
export class MemberModel extends Model<XRCSchema.Member, MemberCreationAttributes> {
    declare discord_id: string
    declare uid: string | null
    declare name: string | null
    declare email: string | null
    declare scoresaber_id: string | null
}

export const MemberModelFactory: ModelFactory = {
    initModel: (sequelize) => {
        MemberModel.init({
            id: {
                primaryKey: true,
                type: INTEGER,
                autoIncrement: true
            },

            discord_id: {
                type: STRING,
            },

            directory_id:  {
                type: STRING
            },

            name: {
                type: STRING
            },

            email: {
                type: STRING
            },

            scoresaber_id: {
                type: STRING
            },

            tl_account_id: {
                type: STRING,
                unique: true
            },

            tl_issuance_id: {
                type: STRING,
                unique: true
            },

            steam_id: {
                type: STRING
            },

            oculus_id: {
                type: STRING
            },

            signed_waiver: {
                type: BOOLEAN,
                defaultValue: false
            }
        },
        {
            tableName: "members",
            sequelize: sequelize,
        });
    },

    associate: () => {
        MemberModel.hasMany(AttendanceModel, { foreignKey: "member_id", onDelete: "CASCADE" })
    }
}