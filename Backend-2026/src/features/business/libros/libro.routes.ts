import { Application } from "express";
import { business } from "../../../middlewares/auth";
import { LibroController } from "./libro.controller";

export class LibroRoutes {
  public libroController: LibroController = new LibroController();

  public routes(app: Application): void {
    const c = this.libroController;
    app.route("/api/libros").get(...business, c.getAll).post(...business, c.create);
    app
      .route("/api/libros/:id")
      .get(...business, c.getOne)
      .put(...business, c.updatePut)
      .patch(...business, c.updatePatch)
      .delete(...business, c.deletePhysical);
    app.route("/api/libros/:id/deactivate").patch(...business, c.deleteLogical);
  }
}
