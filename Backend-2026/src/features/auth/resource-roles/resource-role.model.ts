import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Pivote `resource_roles` — /api/concesiones-rol. Cada fila activa ES un permiso. */
export class ResourceRole extends Model {
  declare id: number;
  declare resource_id: number;
  declare role_id: number;
  declare status: Status;
}

ResourceRole.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    resource_id: { type: DataTypes.INTEGER, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  {
    sequelize,
    modelName: "ResourceRole",
    tableName: "resource_roles",
    timestamps: true,
    indexes: [{ unique: true, fields: ["resource_id", "role_id"] }],
  },
);
