import { Application } from "express";
import { secured } from "../../../middlewares/auth";
import { ResourceController } from "./resource.controller";

export class ResourceRoutes {
  public resourceController: ResourceController = new ResourceController();

  public routes(app: Application): void {
    const c = this.resourceController;
    app.route("/api/recursos").get(...secured, c.getAll).post(...secured, c.create);
    app
      .route("/api/recursos/:id")
      .get(...secured, c.getOne)
      .put(...secured, c.updatePut)
      .patch(...secured, c.updatePatch)
      .delete(...secured, c.deletePhysical);
    app.route("/api/recursos/:id/deactivate").patch(...secured, c.deleteLogical);
  }
}
