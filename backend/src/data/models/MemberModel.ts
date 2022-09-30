import { XRCSchema } from "@xrc/XRCSchema";
import { INTEGER, STRING } from "sequelize";
import { AttendanceModel } from "./AttendanceModel";
import ModelFactory, {
  createColumn, OmitId, XRCModel
} from "./ModelFactory";

export type MemberCreationAttributes = OmitId<XRCSchema.MemberAttributes>;
export class MemberModel extends XRCModel<
  XRCSchema.MemberAttributes,
  MemberCreationAttributes
> {}

export const MemberModelFactory: ModelFactory = {
  initModel: (sequelize) => {
    MemberModel.init(
      {
        id: {
          primaryKey: true,
          type: INTEGER,
          autoIncrement: true,
        },
        discordId: createColumn(STRING, true, "discord_id"),
        scoresaberId: createColumn(STRING, true, "scoresaber_id"),
        steamId: createColumn(STRING, true, "steam_id"),
        oculusId: createColumn(STRING, true, "oculus_id"),
        terplinkAccountId: createColumn(STRING, true, "terplink_account_id"),
        terplinkIssuanceId: createColumn(STRING, true, "terplink_issuance_id"),
        name: createColumn(STRING, true, "name"),
        email: createColumn(STRING, true, "email"),
        directoryId: createColumn(STRING, true, "directory_id")
      },
      {
        tableName: "members",
        sequelize: sequelize,
      }
    );
  },

  associate: () => {
    MemberModel.hasMany(AttendanceModel, { foreignKey: "member_id", onDelete: "CASCADE" })
    //MemberModel.hasMany(AttendanceModel, { foreignKey: "member_id", onDelete: "CASCADE" })
  },
};
