import { Application } from "express";
import { secured } from "../../../middlewares/auth";
import { RoleController } from "./role.controller";

export class RoleRoutes {
  public roleController: RoleController = new RoleController();

  public routes(app: Application): void {
    const c = this.roleController;
    app.route("/api/roles").get(...secured, c.getAll).post(...secured, c.create);
    app
      .route("/api/roles/:id")
      .get(...secured, c.getOne)
      .put(...secured, c.updatePut)
      .patch(...secured, c.updatePatch)
      .delete(...secured, c.deletePhysical);
    app.route("/api/roles/:id/deactivate").patch(...secured, c.deleteLogical);
  }
}
