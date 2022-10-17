import { XRCSchema } from "@xrc/XRCSchema";
import { Model, Optional, STRING } from "sequelize";
import { XRCHeartbeatModel } from "./HeartbeatModel";
import ModelFactory from "./ModelFactory";

export interface XRCDeviceCreationAttributes extends Optional<XRCSchema.DeviceAttributes, "macAddress"> {}

export class XRCDeviceModel extends Model<XRCSchema.DeviceAttributes, XRCDeviceCreationAttributes> {
    declare serial: string
    declare macAddress: string | null
    declare name: string
}

export const DeviceModelFactory: ModelFactory = {
    initModel: (sql) => {
        XRCDeviceModel.init({
            serial: {
                primaryKey: true,
                type: STRING
            },

            name: {
                type: STRING,
                allowNull: false
            }
        },
        {
            tableName: 'devices',
            sequelize: sql,
        })
    },
    associate: () => {
        XRCDeviceModel.hasMany(XRCHeartbeatModel, { foreignKey: "serial", onDelete: "CASCADE" })
    }
}