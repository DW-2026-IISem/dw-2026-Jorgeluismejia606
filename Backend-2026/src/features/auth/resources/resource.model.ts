import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

/** Tabla `resources` — /api/recursos. Cada fila es un par (method, path). */
export class Resource extends Model {
  declare id: number;
  declare path: string;
  declare method: HttpMethod;
  declare description: string | null;
  declare status: Status;
}

Resource.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    path: {
      type: DataTypes.STRING(160),
      allowNull: false,
      validate: { is: { args: /^\/api\//, msg: "path debe empezar por /api/" } },
    },
    method: {
      type: DataTypes.ENUM(...HTTP_METHODS),
      allowNull: false,
      set(value: unknown) {
        this.setDataValue("method", String(value ?? "").toUpperCase());
      },
    },
    description: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  {
    sequelize,
    modelName: "Resource",
    tableName: "resources",
    timestamps: true,
    indexes: [{ unique: true, fields: ["method", "path"] }],
  },
);
