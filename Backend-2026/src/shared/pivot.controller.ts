import { Request, Response } from "express";
import { Includeable, Model, ModelStatic, WhereOptions } from "sequelize";
import { HttpError, action, body, notFound, paramId } from "./http";

interface Parent {
  key: string;
  model: ModelStatic<Model>;
  label: string;
}

export interface PivotConfig {
  model: ModelStatic<Model>;
  plural: string;
  singular: string;
  label: string;
  /** Las dos FKs del pivote, con el modelo padre de cada una. */
  parents: [Parent, Parent];
  include: Includeable[];
}

/**
 * Pivotes RBAC (role_users, resource_roles). POST es create-or-reactivate:
 * si la pareja existe inactiva se reactiva en lugar de duplicarla.
 */
export class PivotController {
  constructor(private readonly config: PivotConfig) {}

  private load(id: number) {
    return this.config.model.findByPk(id, { include: this.config.include });
  }

  private async findOr404(id: number): Promise<Model> {
    const row = await this.config.model.findByPk(id);
    if (!row) throw notFound(this.config.label);
    return row;
  }

  /** Filtros opcionales por FK: `?role_id=2&resource_id=5`. */
  getAll = action(async (req: Request, res: Response) => {
    const where: Record<string, number> = {};
    for (const { key } of this.config.parents) {
      const raw = req.query[key];
      if (raw !== undefined && raw !== "") {
        const value = Number(raw);
        if (!Number.isInteger(value) || value <= 0) throw new HttpError(400, `${key} inválido`);
        where[key] = value;
      }
    }
    const rows = await this.config.model.findAll({
      where: where as WhereOptions,
      include: this.config.include,
      order: [["id", "ASC"]],
    });
    res.status(200).json({ [this.config.plural]: rows });
  });

  getOne = action(async (req: Request, res: Response) => {
    const row = await this.load(paramId(req));
    if (!row) throw notFound(this.config.label);
    res.status(200).json({ [this.config.singular]: row });
  });

  create = action(async (req: Request, res: Response) => {
    const data = body(req) as Record<string, unknown>;
    const where: Record<string, number> = {};
    for (const parent of this.config.parents) {
      const value = Number(data[parent.key]);
      if (!Number.isInteger(value) || value <= 0) {
        throw new HttpError(400, "Faltan campos obligatorios", parent.key);
      }
      const exists = await parent.model.findByPk(value);
      if (!exists) throw new HttpError(400, `${parent.label} no existe`, `${parent.key}=${value}`);
      where[parent.key] = value;
    }

    const existing = await this.config.model.findOne({ where: where as WhereOptions });
    if (existing && existing.get("status") === "active") {
      throw new HttpError(409, `${this.config.label} ya existe y está activa`, `id=${String(existing.get("id"))}`);
    }

    let id: number;
    let status = 201;
    let message = `${this.config.label} creada`;
    if (existing) {
      await existing.update({ status: "active" });
      id = Number(existing.get("id"));
      status = 200;
      message = `${this.config.label} reactivada`;
    } else {
      const created = await this.config.model.create({ ...where, status: "active" } as never);
      id = Number(created.get("id"));
    }
    res.status(status).json({ message, [this.config.singular]: await this.load(id) });
  });

  private setStatus(next: "active" | "inactive", verb: string) {
    return action(async (req: Request, res: Response) => {
      const id = paramId(req);
      const row = await this.findOr404(id);
      await row.update({ status: next });
      res.status(200).json({ message: `${this.config.label} ${verb}`, [this.config.singular]: await this.load(id) });
    });
  }

  deleteLogical = this.setStatus("inactive", "desactivada");
  reactivate = this.setStatus("active", "reactivada");

  deletePhysical = action(async (req: Request, res: Response) => {
    const id = paramId(req);
    const row = await this.findOr404(id);
    await row.destroy();
    res.status(200).json({ message: `${this.config.label} eliminada`, id });
  });
}
