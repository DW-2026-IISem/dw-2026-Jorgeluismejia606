import { Application } from "express";
import { business } from "../../../middlewares/auth";
import { LectorController } from "./lector.controller";

export class LectorRoutes {
  public lectorController: LectorController = new LectorController();

  public routes(app: Application): void {
    const c = this.lectorController;
    // ================== RUTAS CON authenticate + authorize (abiertas si AUTH_ENABLED=false) ==================
    app.route("/api/lectores").get(...business, c.getAll).post(...business, c.create);
    app
      .route("/api/lectores/:id")
      .get(...business, c.getOne)
      .put(...business, c.updatePut)
      .patch(...business, c.updatePatch)
      .delete(...business, c.deletePhysical);
    app.route("/api/lectores/:id/deactivate").patch(...business, c.deleteLogical);
  }
}
