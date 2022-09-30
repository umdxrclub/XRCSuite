import { AbstractDataTypeConstructor, DataType, Model, Sequelize, STRING } from "sequelize";

/**
 * Represents a model that can be initialized through a Sequelizable instance.
 */
 export default interface ModelFactory {
    initModel: (sequelize: Sequelize) => void,
    associate?: () => void
}

/**
 * Keys to strip from the created data object.
 */
const KEYS_TO_STRIP = [
    "createdAt",
    "updatedAt"
]

export abstract class XRCModel<T extends {},CT extends {}> extends Model<Required<T>,OmitId<CT>>
{
    getData(): T {
        type KoT = keyof(T)
        let data = this.get() as T;
        let keys = Object.keys(data).filter(k => !KEYS_TO_STRIP.includes(k) && data[k as KoT] != null);
        let obj: Record<string, any> = {};
        keys.forEach(k => obj[k] = data[k as KoT]);
        return obj as T;
    }
}

export type OmitId<T> = Omit<T, "id">

export function createColumn(columnType: AbstractDataTypeConstructor, nullable: boolean, fieldName?: string, unique?: boolean)
{
    return {
        type: columnType,
        allowNull: nullable,
        field: fieldName,
        unique: unique
    }
}