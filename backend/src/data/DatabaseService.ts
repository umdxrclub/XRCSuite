import { Sequelize } from "sequelize";
import { BackendService } from "../services/BackendService";
import { useXRCHost } from "../util/xrc-host-file";
import { AttendanceModelFactory } from "./models/AttendanceModel";
import { DeviceModelFactory, XRCDeviceModel } from "./models/DeviceModel";
import { HeartbeatModelFactory, XRCHeartbeatModel } from "./models/HeartbeatModel";
import { MemberModel, MemberModelFactory } from "./models/MemberModel";
import ModelFactory from "./models/ModelFactory";

var sql: Sequelize;

const MODEL_FACTORIES: ModelFactory[] = [
    DeviceModelFactory,
    MemberModelFactory,
    HeartbeatModelFactory,
    AttendanceModelFactory
]

export const MODELS = {
    device: XRCDeviceModel,
    member: MemberModel,
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

        // Initialize all models
        MODEL_FACTORIES.forEach(model => {
            model.initModel(sql);
        })

        // Associate all models
        MODEL_FACTORIES.forEach(model => {
            if (model.associate)
                model.associate()
        })

        await sql.sync();

        console.log("DB ready!");
    }
}