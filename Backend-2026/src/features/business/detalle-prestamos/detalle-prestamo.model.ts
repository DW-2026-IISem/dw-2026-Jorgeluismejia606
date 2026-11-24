import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Tabla `detalle_prestamos` — /api/detalle-prestamos (una línea por libro prestado). */
export class DetallePrestamo extends Model {
  declare id: number;
  declare prestamo_id: number;
  declare libro_id: number;
  declare cantidad: number;
  declare precio_unitario: number;
  declare total_linea: number;
  declare status: Status;
}

DetallePrestamo.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    prestamo_id: { type: DataTypes.INTEGER, allowNull: false },
    libro_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: "cantidad debe ser al menos 1" } },
    },
    precio_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    total_linea: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  { sequelize, modelName: "DetallePrestamo", tableName: "detalle_prestamos", timestamps: true },
);
