import { DEFAULT_LAB_STORE, LabStore } from '../Lab'
import { JSON as DB_JSON, Sequelize, STRING } from 'sequelize';
import ModelFactory, { createColumn, XRCModel } from './ModelFactory';

type KeyValueEntry = {
    name: string,
    json: string
}

type Store = {
    lab: LabStore
}

type StoreKey = keyof Store;
type StoreValue<T extends StoreKey> = Store[T];

const DEFAULT_STORE: Store = {
    lab: DEFAULT_LAB_STORE
}

export class JSONStoreModel extends XRCModel<KeyValueEntry, KeyValueEntry> {
    static cache: Partial<Store> = {}

    static async getStore<T extends StoreKey>(name: T) {
        type V = Store[T];
        let cacheKeys = Object.keys(this.cache);
        var store: V | undefined = undefined;
        if (cacheKeys.includes(name)) {
            // The JSONStore is in the memory cache.
            store = this.cache[name];
        } else {
            // The JSONStore is not loaded into memory yet or does not exist.
            let sqlStore = await JSONStoreModel.findOne({where: {
                name: name
            }});

            if (sqlStore) {
                // Store was found within SQL database.
                store = JSON.parse(sqlStore.getData().json);
            } else {
                // Store was not found within SQL database, use default type and
                // store it in the database.
                store = DEFAULT_STORE[name];
                this.saveStore("lab", store);
            }

            this.cache[name] = store;
        }

        return store;
    }

    static async saveStore<T extends StoreKey>(name: T, value: StoreValue<T>) {
        // Save to cache.
        this.cache[name] = value;

        // Save to DB
        await JSONStoreModel.upsert({
            name: name,
            json: JSON.stringify(value)
        })
    }

    static async updateStore<T extends StoreKey>(name: T, handler: (v: StoreValue<T>) => StoreValue<T>)
    {
        let val = await this.getStore(name);
        if (val)
            await this.saveStore(name, handler(val));
    }
}

export const JSONStoreFactory: ModelFactory = {
    initModel: function (sequelize: Sequelize): void {
        JSONStoreModel.init({
            name: {...createColumn(STRING, false), primaryKey: true },
            json: createColumn(DB_JSON, false)
        },
        {
            tableName: "store",
            sequelize: sequelize
        });
    }
}