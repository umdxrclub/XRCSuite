import { BOOLEAN, INTEGER, Model, NUMBER, Optional, STRING } from "sequelize";
import { XRCSchema } from "xrc-schema";
import ModelFactory from "./ModelFactory";


export interface XRCMemberCreationAttributes extends Optional<XRCSchema.Member, "directory_id" | "name" | "email" | "scoresaber_id"> {}
export class XRCMemberModel extends Model<XRCSchema.Member, XRCMemberCreationAttributes> {
    declare discord_id: string
    declare uid: string | null
    declare name: string | null
    declare email: string | null
    declare scoresaber_id: string | null
}

export const XRCMemberModelFactory: ModelFactory = {
    initModel: (sequelize) => {
        XRCMemberModel.init({
            id: {
                primaryKey: true,
                type: INTEGER,
                autoIncrement: true
            },

            discord_id: {
                type: STRING
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

            terplink_id: {
                type: STRING
            }
        },
        {
            tableName: "members",
            sequelize: sequelize
        });
    }
}