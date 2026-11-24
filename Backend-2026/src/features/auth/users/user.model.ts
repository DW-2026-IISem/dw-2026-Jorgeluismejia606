import bcrypt from "bcryptjs";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";
import { Status } from "../../../shared/http";

/** Tabla `users` — /api/usuarios. `password` nunca sale en las respuestas. */
export interface UserI {
  id?: number;
  username: string;
  email: string;
  password: string;
  avatar: string | null;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare avatar: string | null;
  declare status: Status;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  checkPassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }

  /** Representación pública (sin password). */
  toSafeJSON(): Omit<UserI, "password"> {
    const { password: _password, ...safe } = this.toJSON() as UserI;
    return safe;
  }
}

async function hash(user: User): Promise<void> {
  if (user.changed("password") && user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: "username no puede estar vacío" } },
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: "email debe ser un correo válido" } },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    avatar: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    defaultScope: { attributes: { exclude: ["password"] } },
    scopes: { withPassword: { attributes: { include: ["password"] } } },
    hooks: {
      beforeCreate: hash,
      beforeUpdate: hash,
      beforeBulkCreate: async (users: User[]) => {
        for (const user of users) await hash(user);
      },
    },
  },
);
