import { Sequelize } from "sequelize";

/**
 * Represents a model that can be initialized through a Sequelizable instance.
 */
 export default interface ModelFactory {
    initModel: (sequelize: Sequelize) => void,
    associate?: () => void
}