import cors from "cors";
import dotenv from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { authConfig } from "./auth";
import "../database/associations";
import { getDatabaseInfo, syncDatabase, testConnection } from "../database/db";
import { Routes } from "../routes/index";
import { setupSwagger } from "../swagger/index";

dotenv.config();

export class App {
  public app: Application;
  public routePrv: Routes = new Routes();

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.docs();
    this.errors();
  }

  private settings(): void {
    this.app.set("port", this.port || process.env.PORT || 4000);
    this.app.disable("x-powered-by");
  }

  private middlewares(): void {
    if (process.env.NODE_ENV !== "test") this.app.use(morgan("dev"));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    const r = this.routePrv;
    r.healthRoutes.routes(this.app);
    // Negocio
    r.lectorRoutes.routes(this.app);
    r.categoriaRoutes.routes(this.app);
    r.libroRoutes.routes(this.app);
    r.prestamoRoutes.routes(this.app);
    r.detallePrestamoRoutes.routes(this.app);
    // Seguridad
    r.sessionRoutes.routes(this.app);
    r.userRoutes.routes(this.app);
    r.roleRoutes.routes(this.app);
    r.resourceRoutes.routes(this.app);
    r.roleUserRoutes.routes(this.app);
    r.resourceRoleRoutes.routes(this.app);
  }

  private docs(): void {
    setupSwagger(this.app);
  }

  /** 404 y errores no controlados con el formato `{ error, detail? }`. */
  private errors(): void {
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: "Ruta no encontrada", detail: `${req.method} ${req.path}` });
    });
    this.app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
      if (err.type === "entity.parse.failed") {
        res.status(400).json({ error: "JSON mal formado", detail: err.message });
        return;
      }
      console.error("❌ Error no controlado:", err);
      res.status(err.status ?? 500).json({ error: "Error interno del servidor", detail: err.message });
    });
  }

  public async dbConnection(): Promise<void> {
    const dbInfo = getDatabaseInfo();
    console.log(`🔗 Intentando conectar a: ${dbInfo.engine.toUpperCase()} (${dbInfo.connectionString})`);
    if (!(await testConnection())) {
      throw new Error(`No se pudo conectar a la base de datos ${dbInfo.engine.toUpperCase()}`);
    }
    await syncDatabase();
    console.log("📦 Base de datos sincronizada exitosamente");
  }

  async listen(): Promise<void> {
    await this.dbConnection();
    const port = this.app.get("port");
    await new Promise<void>((resolve, reject) => {
      const server = this.app.listen(port, () => resolve());
      server.on("error", reject);
    });
    console.log(`🚀 LecturaAbierta API (Express) en http://localhost:${port}/api`);
    console.log(`📘 Swagger UI: http://localhost:${port}/api/docs`);
    console.log(
      authConfig.enabled
        ? "🔒 AUTH_ENABLED=true → Fase II: JWT + RBAC en todas las rutas"
        : "🔓 AUTH_ENABLED=false → Fase I: rutas de negocio abiertas (laboratorio)",
    );
  }
}
