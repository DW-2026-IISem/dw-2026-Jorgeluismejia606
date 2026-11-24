import { Request, Response } from "express";
import { currentUser } from "../../../middlewares/auth";
import { action, body } from "../../../shared/http";
import { getEffectivePermissions } from "../permissions/permission.service";
import { login, logout, refresh } from "./session.service";

/** Feature Session: login / refresh / logout (OPEN) y perfil (JWT). */
export class SessionController {
  login = action(async (req: Request, res: Response) => {
    const { identifier, password } = body<{ identifier: string; password: string }>(req);
    res.status(200).json(await login(identifier, password));
  });

  refresh = action(async (req: Request, res: Response) => {
    res.status(200).json(await refresh(body<{ refresh_token: string }>(req).refresh_token));
  });

  logout = action(async (req: Request, res: Response) => {
    await logout(body<{ refresh_token: string }>(req).refresh_token);
    res.status(200).json({ message: "Sesión cerrada" });
  });

  /** GET /api/sesion/perfil → `{ user }` */
  profile = action(async (_req: Request, res: Response) => {
    res.status(200).json({ user: currentUser(res).toSafeJSON() });
  });

  /** GET /api/permisos → `{ permissions }` del usuario autenticado. */
  permissions = action(async (_req: Request, res: Response) => {
    res.status(200).json({ permissions: await getEffectivePermissions(currentUser(res).id) });
  });
}
