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
        }))?.heartbeat ?? undefined
    }
}

export const XRCHeartbeatModelFactory: ModelFactory = {
    initModel: (sql) => {
        XRCHeartbeatModel.init({
            serial: {
                type: STRING,
                references: {
                    model: XRCDeviceModel,
                    key: "serial"
                }
            },
            heartbeat: {
                type: JSON
            },
            externalIp: {
                type: STRING,
            }
        },
        {
            tableName: "heartbeats",
            sequelize: sql,
        })
    }
}