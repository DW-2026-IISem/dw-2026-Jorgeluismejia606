import { Application, NextFunction, Request, Response } from "express";
import { authenticate, authorize, currentUser, secured } from "../../../middlewares/auth";
import { UserController } from "./user.controller";

/** Cambiar la PROPIA contraseña no requiere RBAC; la de otro usuario sí. */
function selfOrAuthorize(req: Request, res: Response, next: NextFunction) {
  if (String(currentUser(res).id) === String(req.params.id)) return next();
  return authorize(req, res, next);
}

export class UserRoutes {
  public userController: UserController = new UserController();

  public routes(app: Application): void {
    const c = this.userController;
    app.route("/api/usuarios").get(...secured, c.getAll).post(...secured, c.create);
    app
      .route("/api/usuarios/:id")
      .get(...secured, c.getOne)
      .patch(...secured, c.updatePatch)
      .delete(...secured, c.deletePhysical);
    app.route("/api/usuarios/:id/permisos").get(...secured, c.permissions);
    app.route("/api/usuarios/:id/password").patch(authenticate, selfOrAuthorize, c.changePassword);
    app.route("/api/usuarios/:id/deactivate").patch(...secured, c.deleteLogical);
    app.route("/api/usuarios/:id/reactivate").patch(...secured, c.reactivate);
  }
}
