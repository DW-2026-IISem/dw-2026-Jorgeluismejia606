import { Application } from "express";
import { business } from "../../../middlewares/auth";
import { CategoriaController } from "./categoria.controller";

export class CategoriaRoutes {
  public categoriaController: CategoriaController = new CategoriaController();

  public routes(app: Application): void {
    const c = this.categoriaController;
    app.route("/api/categorias").get(...business, c.getAll).post(...business, c.create);
    app
      .route("/api/categorias/:id")
      .get(...business, c.getOne)
      .put(...business, c.updatePut)
      .patch(...business, c.updatePatch)
      .delete(...business, c.deletePhysical);
    app.route("/api/categorias/:id/deactivate").patch(...business, c.deleteLogical);
  }
}
