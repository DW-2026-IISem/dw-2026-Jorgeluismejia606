import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth";
import { hasPermission } from "../features/auth/permissions/permission.service";
import { User } from "../features/auth/users/user.model";

export interface AccessTokenPayload {
  sub: number;
  username: string;
}

/** Usuario autenticado de la petición (lo deja `authenticate`). */
export function currentUser(res: Response): User {
  return res.locals.user as User;
}

/** ¿Quién eres? Exige `Authorization: Bearer <access_token>` válido y usuario activo. */
export const authenticate: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Token Bearer requerido" });
    return;
  }
  try {
    const payload = jwt.verify(token, authConfig.jwtSecret) as unknown as AccessTokenPayload;
    const user = await User.findByPk(Number(payload.sub));
    if (!user || user.status !== "active") {
      res.status(401).json({ error: "Usuario inexistente o inactivo" });
      return;
    }
    res.locals.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

/**
 * ¿Qué puedes hacer? Compara (método, patrón de ruta) con los permisos efectivos.
 * El patrón sale de `req.route.path` (p. ej. `/api/lectores/:id`), igual que en `resources`.
 */
export const authorize: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const pattern = typeof req.route?.path === "string" ? req.route.path : req.path;
  try {
    if (await hasPermission(currentUser(res).id, req.method, pattern)) {
      next();
      return;
    }
    res.status(403).json({ error: "Acceso denegado", detail: `${req.method} ${pattern}` });
  } catch (error) {
    res.status(500).json({ error: "Error verificando permisos", detail: String(error) });
  }
};

/** Rutas de administración/seguridad: siempre JWT + RBAC. */
export const secured: RequestHandler[] = [authenticate, authorize];

/** Rutas de negocio: JWT + RBAC, salvo en Fase I (AUTH_ENABLED=false). */
export const business: RequestHandler[] = authConfig.enabled ? secured : [];

/** Solo JWT (perfil, permisos propios). */
export const jwtOnly: RequestHandler[] = [authenticate];
