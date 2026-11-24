import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Tabla `roles` — /api/roles. `name` se guarda siempre en MAYÚSCULAS. */
export class Role extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare status: Status;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: "name no puede estar vacío" } },
      set(value: unknown) {
        this.setDataValue("name", String(value ?? "").trim().toUpperCase());
      },
    },
    description: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  { sequelize, modelName: "Role", tableName: "roles", timestamps: true },
);
