import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Tabla `prestamos` — /api/prestamos (cabecera; equivale a «ventas» de la guía). */
export class Prestamo extends Model {
  declare id: number;
  declare fecha_prestamo: Date;
  declare subtotal: number;
  declare impuesto: number;
  declare descuentos: number;
  declare total: number;
  declare lector_id: number;
  declare status: Status;
}

const money = (field: string) => ({
  type: DataTypes.DECIMAL(12, 2),
  allowNull: false,
  defaultValue: 0,
  validate: { min: { args: [0] as const, msg: `${field} no puede ser negativo` } },
});

Prestamo.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fecha_prestamo: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    subtotal: money("subtotal"),
    impuesto: money("impuesto"),
    descuentos: money("descuentos"),
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    lector_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  { sequelize, modelName: "Prestamo", tableName: "prestamos", timestamps: true },
);
