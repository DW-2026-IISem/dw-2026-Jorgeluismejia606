import { NextFunction, Request, RequestHandler, Response } from "express";
import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";

export type Status = "active" | "inactive";
export const STATUSES: Status[] = ["active", "inactive"];

/** Error de negocio con código HTTP: lo traduce `handleError`. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: string,
  ) {
    super(message);
  }
}

export function paramId(req: Request, name = "id"): number {
  const raw = req.params[name];
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new HttpError(400, "Identificador inválido", `${name}=${String(raw)}`);
  }
  return value;
}

/** Express 5 deja `req.body` en undefined si no llega JSON. */
export function body<T = Record<string, unknown>>(req: Request): Partial<T> {
  return (req.body ?? {}) as Partial<T>;
}

/** Copia solo las claves permitidas que vienen definidas en el cuerpo. */
export function pick<T extends object>(source: T, keys: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

export function requireFields(source: object, fields: readonly string[]): void {
  const missing = fields.filter((field) => {
    const value = (source as Record<string, unknown>)[field];
    return value === undefined || value === null || value === "";
  });
  if (missing.length) {
    throw new HttpError(400, "Faltan campos obligatorios", missing.join(", "));
  }
}

export function assertStatus(value: unknown): void {
  if (value !== undefined && !STATUSES.includes(value as Status)) {
    throw new HttpError(400, "status inválido", "Valores permitidos: active, inactive");
  }
}

/** Traduce cualquier error al formato `{ error, detail? }` que espera el frontend. */
export function handleError(res: Response, error: unknown, fallback = "Error interno"): void {
  if (error instanceof HttpError) {
    res.status(error.status).json(error.detail ? { error: error.message, detail: error.detail } : { error: error.message });
    return;
  }
  if (error instanceof UniqueConstraintError) {
    const fields = Object.keys(error.fields ?? {}).join(", ");
    res.status(409).json({ error: "Registro duplicado", detail: fields || error.message });
    return;
  }
  if (error instanceof ForeignKeyConstraintError) {
    res.status(409).json({ error: "El registro está relacionado con otros datos", detail: error.message });
    return;
  }
  if (error instanceof ValidationError) {
    res.status(400).json({ error: "Datos inválidos", detail: error.errors.map((e) => e.message).join("; ") });
    return;
  }
  console.error("❌", fallback, error);
  res.status(500).json({ error: fallback, detail: String(error) });
}

/** Envuelve un handler async: cualquier excepción termina en `handleError`. */
export function action(
  fn: (req: Request, res: Response) => Promise<void>,
  fallback?: string,
): RequestHandler {
  return (req: Request, res: Response, _next: NextFunction) => {
    fn(req, res).catch((error) => handleError(res, error, fallback));
  };
}

export function notFound(entity: string): HttpError {
  return new HttpError(404, `${entity} no encontrado`);
}
