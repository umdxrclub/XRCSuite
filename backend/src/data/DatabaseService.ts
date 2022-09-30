import { Sequelize } from "sequelize";
import XRC from "../data/XRC";
import { AttendanceModel, AttendanceModelFactory } from './models/AttendanceModel';
import { EventModel, EventModelFactory } from './models/EventModel';
import { JSONStoreFactory, JSONStoreModel } from './models/KeyValueModel';
import { MemberModel, MemberModelFactory } from "./models/MemberModel";

var sql: Sequelize;

export const XRCDatabase = {
    factories: [
        MemberModelFactory,
        JSONStoreFactory,
        EventModelFactory,
        AttendanceModelFactory
    ],
    models: {
        members: MemberModel,
        store: JSONStoreModel,
        events: EventModel,
        attendance: AttendanceModel
    },
    init: async function (): Promise<void> {
        const host = XRC.host;

        sql = new Sequelize(host.db.database, host.db.username, host.db.password, {
            host: "127.0.0.1",
            dialect: "postgres",
            logging: false,
            port: host.db.port
        })

        await sql.authenticate();

        // Initialize all models
        this.factories.forEach(model => {
            model.initModel(sql);
        })

        // Associate all models
        this.factories.forEach(model => {
            if (model.associate)
                model.associate()
        })

        await sql.sync();

        console.log("DB ready!");
    }
}