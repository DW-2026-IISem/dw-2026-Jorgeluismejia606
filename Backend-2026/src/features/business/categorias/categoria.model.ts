import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Tabla `categorias` — /api/categorias (equivale a «tipos de producto» de la guía). */
export interface CategoriaI {
  id?: number;
  nombre: string;
  descripcion: string | null;
  status: Status;
}

export class Categoria extends Model {
  declare id: number;
  declare nombre: string;
  declare descripcion: string | null;
  declare status: Status;
}

Categoria.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: "nombre no puede estar vacío" } },
    },
    descripcion: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  { sequelize, modelName: "Categoria", tableName: "categorias", timestamps: true },
);
