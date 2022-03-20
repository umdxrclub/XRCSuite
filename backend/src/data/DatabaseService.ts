import { Sequelize } from "sequelize";
import { BackendService } from "../services/BackendService";
import { useXRCHost } from "../util/xrc-host-file";
import { XRCDeviceModelFactory } from "./models/DeviceModel";
import { XRCMemberModelFactory } from "./models/MemberModel";
import ModelFactory from "./models/ModelFactory";

var sql: Sequelize;

const MODELS: ModelFactory[] = [ XRCDeviceModelFactory, XRCMemberModelFactory ]

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

        MODELS.forEach(model => {
            model.initModel(sql);
        })

        await sql.sync();

        console.log("DB ready!");
    }
}