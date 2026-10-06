import { Application } from "express";
import { ClientController } from "./client.controller";

export class ClientRoutes {
  public clientController: ClientController = new ClientController();

  public routes(app: Application): void {
    // ================== RUTAS SIN AUTENTICACIÓN / SIN MIDDLEWARE JWT ==================

    // getAll
    app
      .route("/api/clientes")
      .get(this.clientController.getAll.bind(this.clientController));

    // getOne
    app
      .route("/api/clientes/:id")
      .get(this.clientController.getOne.bind(this.clientController));

    // create
    app
      .route("/api/clientes")
      .post(this.clientController.create.bind(this.clientController));

    // update (PUT / PATCH)
    app
      .route("/api/clientes/:id")
      .put(this.clientController.updatePut.bind(this.clientController))
      .patch(this.clientController.updatePatch.bind(this.clientController));

    // delete físico
    app
      .route("/api/clientes/:id")
      .delete(this.clientController.deletePhysical.bind(this.clientController));

    // delete lógico
    app
      .route("/api/clientes/:id/deactivate")
      .patch(this.clientController.deleteLogical.bind(this.clientController));
  }
}
