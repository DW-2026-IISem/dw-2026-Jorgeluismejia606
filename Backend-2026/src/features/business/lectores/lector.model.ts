import bcrypt from "bcryptjs";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Tabla `lectores` — /api/lectores. `password` es opcional y nunca se devuelve. */
export interface LectorI {
  id?: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  password?: string | null;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Lector extends Model {
  declare id: number;
  declare nombre: string;
  declare direccion: string | null;
  declare telefono: string | null;
  declare email: string | null;
  declare password: string | null;
  declare status: Status;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toSafeJSON(): Omit<LectorI, "password"> {
    const { password: _password, ...safe } = this.toJSON() as LectorI;
    return safe;
  }
}

async function hash(lector: Lector): Promise<void> {
  if (lector.changed("password") && lector.password) {
    lector.password = await bcrypt.hash(lector.password, 10);
  }
}

Lector.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { notEmpty: { msg: "nombre no puede estar vacío" } },
    },
    direccion: { type: DataTypes.STRING, allowNull: true },
    telefono: { type: DataTypes.STRING(40), allowNull: true },
    email: {
      type: DataTypes.STRING(120),
      allowNull: true,
      unique: true,
      validate: { isEmail: { msg: "email debe ser un correo válido" } },
    },
    password: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  {
    sequelize,
    modelName: "Lector",
    tableName: "lectores",
    timestamps: true,
    defaultScope: { attributes: { exclude: ["password"] } },
    hooks: {
      beforeCreate: hash,
      beforeUpdate: hash,
      beforeBulkCreate: async (rows: Lector[]) => {
        for (const row of rows) await hash(row);
      },
    },
  },
);
