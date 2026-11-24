import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Pivote `role_users` — /api/asignaciones-rol (usuario ↔ rol). */
export class RoleUser extends Model {
  declare id: number;
  declare user_id: number;
  declare role_id: number;
  declare status: Status;
}

RoleUser.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  {
    sequelize,
    modelName: "RoleUser",
    tableName: "role_users",
    timestamps: true,
    indexes: [{ unique: true, fields: ["user_id", "role_id"] }],
  },
);
