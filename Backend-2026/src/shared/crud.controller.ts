import { Request, RequestHandler, Response } from "express";
import { FindOptions, Model, ModelStatic, WhereOptions } from "sequelize";
import {
  action,
  assertStatus,
  body,
  notFound,
  paramId,
  pick,
  requireFields,
} from "./http";

export interface CrudConfig<M extends Model> {
  model: ModelStatic<M>;
  /** Envolturas de respuesta: `{ lectores }` / `{ lector }`. */
  plural: string;
  singular: string;
  /** Nombre legible para los mensajes ("Lector"). */
  label: string;
  /** Campos que se aceptan del cuerpo (lista blanca). */
  fields: readonly string[];
  /** Obligatorios en POST y PUT. */
  required: readonly string[];
  /** getAll devuelve solo `status = active` (patrón de la guía). */
  onlyActive?: boolean;
  order?: FindOptions["order"];
}

/**
 * Controlador CRUD de la guía (getAll, getOne, create, updatePut, updatePatch,
 * deletePhysical, deleteLogical) reutilizable por cada feature.
 * Las features lo extienden y sobrescriben `beforeSave` / `serialize` si lo necesitan.
 */
export class CrudController<M extends Model> {
  constructor(protected readonly config: CrudConfig<M>) {}

  /** Validaciones de negocio antes de crear/actualizar (p. ej. FK activa). */
  protected async beforeSave(_data: Record<string, unknown>, _current?: M): Promise<void> {}

  protected serialize(row: M): object {
    return row.toJSON();
  }

  protected async findOr404(id: number): Promise<M> {
    const row = await this.config.model.findByPk(id);
    if (!row) throw notFound(this.config.label);
    return row;
  }

  private input(req: Request): Record<string, unknown> {
    const data = pick(body(req), this.config.fields);
    assertStatus(data.status);
    return data;
  }

  // ================== READ ==================
  getAll: RequestHandler = action(async (_req: Request, res: Response) => {
    const where = (this.config.onlyActive ? { status: "active" } : {}) as WhereOptions;
    const rows = await this.config.model.findAll({ where, order: this.config.order ?? [["id", "ASC"]] });
    res.status(200).json({ [this.config.plural]: rows.map((row) => this.serialize(row)) });
  });

  getOne: RequestHandler = action(async (req: Request, res: Response) => {
    const row = await this.findOr404(paramId(req));
    res.status(200).json({ [this.config.singular]: this.serialize(row) });
  });

  // ================== CREATE ==================
  create: RequestHandler = action(async (req: Request, res: Response) => {
    const data = this.input(req);
    requireFields(data, this.config.required);
    await this.beforeSave(data);
    const row = await this.config.model.create({ status: "active", ...data } as never);
    res.status(201).json({ [this.config.singular]: this.serialize(row) });
  });

  // ================== UPDATE ==================
  /** PUT: reemplazo completo (exige los obligatorios). */
  updatePut: RequestHandler = action(async (req: Request, res: Response) => {
    const row = await this.findOr404(paramId(req));
    const data = this.input(req);
    requireFields(data, this.config.required);
    await this.beforeSave(data, row);
    await row.update(data);
    res.status(200).json({ [this.config.singular]: this.serialize(row) });
  });

  /** PATCH: actualización parcial. */
  updatePatch: RequestHandler = action(async (req: Request, res: Response) => {
    const row = await this.findOr404(paramId(req));
    const data = this.input(req);
    await this.beforeSave(data, row);
    await row.update(data);
    res.status(200).json({ [this.config.singular]: this.serialize(row) });
  });

  // ================== DELETE ==================
  /** Eliminación física. */
  deletePhysical: RequestHandler = action(async (req: Request, res: Response) => {
    const id = paramId(req);
    const row = await this.findOr404(id);
    await row.destroy();
    res.status(200).json({ message: `${this.config.label} eliminado permanentemente`, id });
  });

  /** Eliminación lógica → status = inactive. */
  deleteLogical: RequestHandler = action(async (req: Request, res: Response) => {
    const row = await this.findOr404(paramId(req));
    await row.update({ status: "inactive" } as never);
    res.status(200).json({
      message: `${this.config.label} desactivado (eliminación lógica)`,
      [this.config.singular]: this.serialize(row),
    });
  });

  /** Reactivación → status = active. */
  reactivate: RequestHandler = action(async (req: Request, res: Response) => {
    const row = await this.findOr404(paramId(req));
    await row.update({ status: "active" } as never);
    res.status(200).json({
      message: `${this.config.label} reactivado`,
      [this.config.singular]: this.serialize(row),
    });
  });
}
