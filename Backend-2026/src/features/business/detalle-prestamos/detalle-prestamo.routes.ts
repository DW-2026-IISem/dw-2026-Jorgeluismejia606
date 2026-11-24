import { Application } from "express";
import { business } from "../../../middlewares/auth";
import { DetallePrestamoController } from "./detalle-prestamo.controller";

export class DetallePrestamoRoutes {
  public detallePrestamoController: DetallePrestamoController = new DetallePrestamoController();

  public routes(app: Application): void {
    const c = this.detallePrestamoController;
    app.route("/api/detalle-prestamos").get(...business, c.getAll).post(...business, c.create);
    app
      .route("/api/detalle-prestamos/:id")
      .get(...business, c.getOne)
      .patch(...business, c.updatePatch)
      .delete(...business, c.deletePhysical);
    app.route("/api/detalle-prestamos/:id/deactivate").patch(...business, c.deleteLogical);
  }
}
