import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { authConfig } from "../../../config/auth";
import { HttpError } from "../../../shared/http";
import { User } from "../users/user.model";
import { RefreshToken } from "./refresh-token.model";

/** Respuesta de login y refresh: SOLO el par de tokens. */
export interface SessionTokens {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

async function issueTokens(user: User, familyId: string): Promise<SessionTokens> {
  const access_token = jwt.sign({ sub: user.id, username: user.username }, authConfig.jwtSecret, {
    expiresIn: authConfig.accessTtl,
  });
  const refresh_token = crypto.randomBytes(48).toString("base64url");
  await RefreshToken.create({
    user_id: user.id,
    token_hash: sha256(refresh_token),
    family_id: familyId,
    expires_at: new Date(Date.now() + authConfig.refreshTtl * 1000),
  });
  return {
    access_token,
    token_type: "Bearer",
    expires_in: authConfig.accessTtl,
    refresh_token,
    refresh_expires_in: authConfig.refreshTtl,
  };
}

async function revokeFamily(familyId: string): Promise<void> {
  await RefreshToken.update(
    { revoked_at: new Date() },
    { where: { family_id: familyId, revoked_at: { [Op.is]: null } } },
  );
}

const invalidCredentials = () => new HttpError(401, "Credenciales inválidas");

/** `identifier` acepta username o email. */
export async function login(identifier: unknown, password: unknown): Promise<SessionTokens> {
  if (typeof identifier !== "string" || typeof password !== "string" || !identifier || !password) {
    throw new HttpError(400, "identifier y password son obligatorios");
  }
  const value = identifier.trim();
  const user = await User.scope("withPassword").findOne({
    where: { [Op.or]: [{ username: value }, { email: value.toLowerCase() }] },
  });
  if (!user || !(await user.checkPassword(password))) throw invalidCredentials();
  if (user.status !== "active") throw new HttpError(403, "Usuario inactivo");
  return issueTokens(user, crypto.randomUUID());
}

/**
 * Rotación: el refresh usado queda revocado y se emite uno nuevo de la misma familia.
 * Si llega un refresh YA revocado → posible robo: se revoca toda la familia.
 */
export async function refresh(token: unknown): Promise<SessionTokens> {
  if (typeof token !== "string" || !token) throw new HttpError(400, "refresh_token es obligatorio");
  const stored = await RefreshToken.findOne({ where: { token_hash: sha256(token) } });
  if (!stored) throw new HttpError(401, "Refresh token inválido");

  if (stored.revoked_at) {
    await revokeFamily(stored.family_id);
    throw new HttpError(401, "Refresh token reutilizado: sesión revocada");
  }
  if (stored.expires_at.getTime() <= Date.now()) {
    await stored.update({ revoked_at: new Date() });
    throw new HttpError(401, "Refresh token expirado");
  }

  const user = await User.findByPk(stored.user_id);
  if (!user || user.status !== "active") {
    await revokeFamily(stored.family_id);
    throw new HttpError(401, "Usuario inexistente o inactivo");
  }

  await stored.update({ revoked_at: new Date() });
  return issueTokens(user, stored.family_id);
}

/** Logout: revoca la familia completa del refresh recibido. */
export async function logout(token: unknown): Promise<void> {
  if (typeof token !== "string" || !token) throw new HttpError(400, "refresh_token es obligatorio");
  const stored = await RefreshToken.findOne({ where: { token_hash: sha256(token) } });
  if (stored) await revokeFamily(stored.family_id);
}
