import { Application } from "express";
import { jwtOnly } from "../../../middlewares/auth";
import { SessionController } from "./session.controller";

export class SessionRoutes {
  public sessionController: SessionController = new SessionController();

  public routes(app: Application): void {
    const c = this.sessionController;
    // OPEN: la credencial viaja en el cuerpo, no en Authorization.
    app.route("/api/sesion/login").post(c.login);
    app.route("/api/sesion/refresh").post(c.refresh);
    app.route("/api/sesion/logout").post(c.logout);
    // JWT: cualquier usuario autenticado (sin RBAC).
    app.route("/api/sesion/perfil").get(...jwtOnly, c.profile);
    app.route("/api/permisos").get(...jwtOnly, c.permissions);
  }
}
