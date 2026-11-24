import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

/**
 * Tabla `refresh_tokens`. Se guarda el SHA-256 del token (nunca el token en claro).
 * `family_id` agrupa las rotaciones de un mismo login: si se reutiliza un refresh
 * ya rotado, se revoca toda la familia (detección de robo).
 */
export class RefreshToken extends Model {
  declare id: number;
  declare user_id: number;
  declare token_hash: string;
  declare family_id: string;
  declare expires_at: Date;
  declare revoked_at: Date | null;
}

RefreshToken.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    family_id: { type: DataTypes.STRING(36), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: true,
    indexes: [{ fields: ["family_id"] }],
  },
);
