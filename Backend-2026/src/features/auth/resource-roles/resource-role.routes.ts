import { Application } from "express";
import { secured } from "../../../middlewares/auth";
import { PivotController } from "../../../shared/pivot.controller";
import { Resource } from "../resources/resource.model";
import { Role } from "../roles/role.model";
import { ResourceRole } from "./resource-role.model";

/** /api/concesiones-rol — envoltura `{ grants }` / `{ message, grant }`. */
export class ResourceRoleRoutes {
  public resourceRoleController = new PivotController({
    model: ResourceRole,
    plural: "grants",
    singular: "grant",
    label: "Concesión",
    parents: [
      { key: "role_id", model: Role, label: "El rol" },
      { key: "resource_id", model: Resource, label: "El recurso" },
    ],
    include: [
      { model: Role, as: "role", attributes: ["id", "name"] },
      { model: Resource, as: "resource", attributes: ["id", "method", "path", "description"] },
    ],
  });

  public routes(app: Application): void {
    const c = this.resourceRoleController;
    app.route("/api/concesiones-rol").get(...secured, c.getAll).post(...secured, c.create);
    app.route("/api/concesiones-rol/:id").get(...secured, c.getOne).delete(...secured, c.deletePhysical);
    app.route("/api/concesiones-rol/:id/deactivate").patch(...secured, c.deleteLogical);
    app.route("/api/concesiones-rol/:id/reactivate").patch(...secured, c.reactivate);
  }
}
