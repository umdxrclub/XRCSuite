import { JSON, Model, Optional, Sequelize, STRING } from "sequelize";
import { XRCSchema } from "xrc-schema";
import { XRCDeviceModel } from "./DeviceModel";
import ModelFactory from "./ModelFactory";

export class XRCHeartbeatModel extends Model<XRCSchema.DeviceHeartbeat, XRCSchema.DeviceHeartbeat> {
    declare serial: string
    declare heartbeat: XRCSchema.Heartbeat
    declare externalIp: string

    static async findLatestHeartbeat(serial: string) {
        return (await XRCHeartbeatModel.findOne({
            where: {
                serial: serial,
            },
            order: [ [ 'createdAt', 'DESC' ]]
        })) as XRCSchema.DeviceHeartbeat | null
    }
}

export const XRCHeartbeatModelFactory: ModelFactory = {
    initModel: (sql) => {
        XRCHeartbeatModel.init({
            heartbeat: {
                type: JSON
            },
            externalIp: {
                type: STRING,
            },
            serial: {
                type: STRING
            }
        },
        {
            tableName: 'heartbeats',
            sequelize: sql,
        })
    },

    associate: () => {
        // Define association with Device model
        XRCHeartbeatModel.belongsTo(XRCDeviceModel, {targetKey: 'serial', foreignKey: 'serial'})
    }
}