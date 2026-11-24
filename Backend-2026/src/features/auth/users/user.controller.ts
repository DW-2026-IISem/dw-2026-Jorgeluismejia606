import { Request, Response } from "express";
import { currentUser } from "../../../middlewares/auth";
import {
  HttpError,
  action,
  assertStatus,
  body,
  notFound,
  paramId,
  pick,
  requireFields,
} from "../../../shared/http";
import { getEffectivePermissions } from "../permissions/permission.service";
import { User } from "./user.model";

const MIN_PASSWORD = 8;

function checkPassword(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length < MIN_PASSWORD) {
    throw new HttpError(400, `${field} debe tener al menos ${MIN_PASSWORD} caracteres`);
  }
  return value;
}

/** /api/usuarios — nunca devuelve `password`. */
export class UserController {
  private async findOr404(id: number): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) throw notFound("Usuario");
    return user;
  }

  private notSelf(req: Request, res: Response, verb: string): void {
    if (currentUser(res)?.id === paramId(req)) {
      throw new HttpError(409, `No puedes ${verb} tu propio usuario`);
    }
  }

  // ================== READ ==================
  getAll = action(async (_req: Request, res: Response) => {
    const users = await User.findAll({ order: [["id", "ASC"]] });
    res.status(200).json({ users });
  });

  getOne = action(async (req: Request, res: Response) => {
    res.status(200).json({ user: await this.findOr404(paramId(req)) });
  });

  /** Permisos efectivos del usuario (misma consulta que usa `authorize`). */
  permissions = action(async (req: Request, res: Response) => {
    const user = await this.findOr404(paramId(req));
    res.status(200).json({ permissions: await getEffectivePermissions(user.id) });
  });

  // ================== CREATE ==================
  create = action(async (req: Request, res: Response) => {
    const data = pick(body(req), ["username", "email", "password", "avatar", "status"]);
    requireFields(data, ["username", "email", "password"]);
    checkPassword(data.password, "password");
    assertStatus(data.status);
    if (typeof data.email === "string") data.email = data.email.trim().toLowerCase();
    const user = await User.create({ status: "active", ...data });
    res.status(201).json({ user: user.toSafeJSON() });
  });

  // ================== UPDATE ==================
  /** PATCH acepta solo username, email y avatar. */
  updatePatch = action(async (req: Request, res: Response) => {
    const user = await this.findOr404(paramId(req));
    const data = pick(body(req), ["username", "email", "avatar"]);
    if (typeof data.email === "string") data.email = data.email.trim().toLowerCase();
    await user.update(data);
    res.status(200).json({ user: user.toSafeJSON() });
  });

  /** Exige la contraseña actual (defensa en profundidad). */
  changePassword = action(async (req: Request, res: Response) => {
    const id = paramId(req);
    const { current_password, new_password } = body<{ current_password: string; new_password: string }>(req);
    requireFields({ current_password, new_password }, ["current_password", "new_password"]);
    checkPassword(new_password, "new_password");
    const user = await User.scope("withPassword").findByPk(id);
    if (!user) throw notFound("Usuario");
    if (!(await user.checkPassword(String(current_password)))) {
      throw new HttpError(400, "La contraseña actual no es correcta");
    }
    await user.update({ password: new_password });
    res.status(200).json({ message: "Contraseña actualizada" });
  });

  // ================== DELETE ==================
  deleteLogical = action(async (req: Request, res: Response) => {
    this.notSelf(req, res, "desactivar");
    const user = await this.findOr404(paramId(req));
    await user.update({ status: "inactive" });
    res.status(200).json({ message: "Usuario desactivado", user });
  });

  reactivate = action(async (req: Request, res: Response) => {
    const user = await this.findOr404(paramId(req));
    await user.update({ status: "active" });
    res.status(200).json({ message: "Usuario reactivado", user });
  });

  deletePhysical = action(async (req: Request, res: Response) => {
    this.notSelf(req, res, "eliminar");
    const id = paramId(req);
    const user = await this.findOr404(id);
    await user.destroy();
    res.status(200).json({ message: "Usuario eliminado permanentemente", id });
  });
}
