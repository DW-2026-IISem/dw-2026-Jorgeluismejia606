import { Application } from "express";
import { secured } from "../../../middlewares/auth";
import { PivotController } from "../../../shared/pivot.controller";
import { Role } from "../roles/role.model";
import { User } from "../users/user.model";
import { RoleUser } from "./role-user.model";

/** /api/asignaciones-rol — envoltura `{ assignments }` / `{ assignment }`. */
export class RoleUserRoutes {
  public roleUserController = new PivotController({
    model: RoleUser,
    plural: "assignments",
    singular: "assignment",
    label: "Asignación de rol",
    parents: [
      { key: "user_id", model: User, label: "El usuario" },
      { key: "role_id", model: Role, label: "El rol" },
    ],
    include: [
      { model: User, as: "user", attributes: ["id", "username", "email"] },
      { model: Role, as: "role", attributes: ["id", "name"] },
    ],
  });

  public routes(app: Application): void {
    const c = this.roleUserController;
    app.route("/api/asignaciones-rol").get(...secured, c.getAll).post(...secured, c.create);
    app.route("/api/asignaciones-rol/:id").get(...secured, c.getOne).delete(...secured, c.deletePhysical);
    app.route("/api/asignaciones-rol/:id/deactivate").patch(...secured, c.deleteLogical);
    app.route("/api/asignaciones-rol/:id/reactivate").patch(...secured, c.reactivate);
  }
}
