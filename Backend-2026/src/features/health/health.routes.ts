import { Application, Request, Response } from "express";
import { getDatabaseInfo, sequelize } from "../../database/db";

/** GET /api/health — OPEN. Útil para `until curl ...; do sleep 2; done`. */
export class HealthRoutes {
  public routes(app: Application): void {
    app.get("/api/health", async (_req: Request, res: Response) => {
      let database = "up";
      try {
        await sequelize.authenticate();
      } catch {
        database = "down";
      }
      res.status(database === "up" ? 200 : 503).json({
        status: database === "up" ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptime: `${process.uptime().toFixed(2)}s`,
        checks: { database: { status: database, engine: getDatabaseInfo().engine } },
      });
    });
  }
}
