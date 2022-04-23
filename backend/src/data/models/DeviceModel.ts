import { Model, Optional, STRING } from "sequelize";
import { XRCSchema } from "xrc-schema";
import { XRCHeartbeatModel } from "./HeartbeatModel";
import ModelFactory from "./ModelFactory";

export interface XRCDeviceCreationAttributes extends Optional<XRCSchema.Device, "macAddress"> {}

export class XRCDeviceModel extends Model<XRCSchema.Device, XRCDeviceCreationAttributes> {
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

            macAddress: {
                type: STRING,
                allowNull: true
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