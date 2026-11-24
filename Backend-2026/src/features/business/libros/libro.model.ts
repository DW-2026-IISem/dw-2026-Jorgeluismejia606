import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Tabla `libros` — /api/libros. `cantidad` = ejemplares disponibles (stock). */
export interface LibroI {
  id?: number;
  titulo: string;
  autor: string;
  precio_prestamo: number;
  stock_minimo: number;
  cantidad: number;
  categoria_id: number;
  status: Status;
}

export class Libro extends Model {
  declare id: number;
  declare titulo: string;
  declare autor: string;
  declare precio_prestamo: number;
  declare stock_minimo: number;
  declare cantidad: number;
  declare categoria_id: number;
  declare status: Status;
}

Libro.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: { msg: "titulo no puede estar vacío" } },
    },
    autor: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: "autor no puede estar vacío" } },
    },
    precio_prestamo: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: { args: [0], msg: "precio_prestamo no puede ser negativo" } },
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: { args: [0], msg: "stock_minimo no puede ser negativo" } },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: { args: [0], msg: "cantidad no puede ser negativa" } },
    },
    categoria_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  { sequelize, modelName: "Libro", tableName: "libros", timestamps: true },
);
