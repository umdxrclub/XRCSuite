import { Sequelize } from "sequelize";
import { BackendService } from "../services/BackendService";
import { useXRCHost } from "../util/xrc-host-file";
import { XRCDeviceModel, XRCDeviceModelFactory } from "./models/DeviceModel";
import { XRCHeartbeatModel, XRCHeartbeatModelFactory } from "./models/HeartbeatModel";
import { XRCMemberModel, XRCMemberModelFactory } from "./models/MemberModel";
import ModelFactory from "./models/ModelFactory";

var sql: Sequelize;

const MODEL_FACTORIES: ModelFactory[] = [
    XRCDeviceModelFactory,
    XRCMemberModelFactory,
    XRCHeartbeatModelFactory
]

export const MODELS = {
    device: XRCDeviceModel,
    member: XRCMemberModel,
    heartbeat: XRCHeartbeatModel
}

export const XRCSequelizeDatabase: BackendService = {
    init: async function (): Promise<void> {
        const host = useXRCHost();

        sql = new Sequelize(host.db.database, host.db.username, host.db.password, {
            host: "127.0.0.1",
            dialect: "postgres",
            logging: false,
            port: host.db.port
        })

        await sql.authenticate();

        MODEL_FACTORIES.forEach(model => {
            model.initModel(sql);
        })

        await sql.sync();

        console.log("DB ready!");
    }
}