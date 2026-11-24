import { Application } from "express";
import { business } from "../../../middlewares/auth";
import { PrestamoController } from "./prestamo.controller";

export class PrestamoRoutes {
  public prestamoController: PrestamoController = new PrestamoController();

  public routes(app: Application): void {
    const c = this.prestamoController;
    app.route("/api/prestamos").get(...business, c.getAll).post(...business, c.create);
    app
      .route("/api/prestamos/:id")
      .get(...business, c.getOne)
      .patch(...business, c.updatePatch)
      .delete(...business, c.deletePhysical);
    app.route("/api/prestamos/:id/deactivate").patch(...business, c.deleteLogical);
  }
}
