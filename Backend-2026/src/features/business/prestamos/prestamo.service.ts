import { Transaction } from "sequelize";
import { sequelize } from "../../../database/db";
import { HttpError, notFound } from "../../../shared/http";
import { DetallePrestamo } from "../detalle-prestamos/detalle-prestamo.model";
import { Lector } from "../lectores/lector.model";
import { Libro } from "../libros/libro.model";
import { Prestamo } from "./prestamo.model";

/**
 * Reglas de negocio de Préstamos + Detalle (equivale a Ventas + Detalle de ventas):
 * - Los precios salen SIEMPRE del libro (`precio_prestamo`), nunca del cliente.
 * - Prestar descuenta ejemplares (`libros.cantidad`); cancelar/eliminar los devuelve.
 * - total = subtotal + impuesto − descuentos, con subtotal = Σ líneas activas.
 */
export interface ItemInput {
  libro_id: number;
  cantidad: number;
}

export interface PrestamoCreateInput {
  lector_id: number;
  impuesto?: number;
  descuentos?: number;
  fecha_prestamo?: string;
  items: ItemInput[];
}

export const round2 = (value: number) => Math.round(value * 100) / 100;

function nonNegative(value: unknown, field: string): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `${field} debe ser un número ≥ 0`);
  return round2(n);
}

export function positiveInt(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, `${field} debe ser un entero ≥ 1`);
  return n;
}

function parseDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new HttpError(400, "fecha_prestamo inválida");
  return date;
}

export async function activeLector(id: number, transaction?: Transaction): Promise<Lector> {
  const lector = await Lector.findByPk(id, { transaction });
  if (!lector) throw new HttpError(400, "El lector no existe", `lector_id=${id}`);
  if (lector.status !== "active") throw new HttpError(400, "El lector está inactivo", `lector_id=${id}`);
  return lector;
}

/** Bloquea el libro dentro de la transacción y valida que haya ejemplares. */
export async function takeStock(libroId: number, cantidad: number, transaction: Transaction): Promise<Libro> {
  const libro = await Libro.findByPk(libroId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!libro) throw new HttpError(400, "El libro no existe", `libro_id=${libroId}`);
  if (libro.status !== "active") throw new HttpError(400, `El libro «${libro.titulo}» está inactivo`);
  if (libro.cantidad < cantidad) {
    throw new HttpError(
      409,
      `Ejemplares insuficientes de «${libro.titulo}»`,
      `disponibles ${libro.cantidad}, solicitados ${cantidad}`,
    );
  }
  await libro.update({ cantidad: libro.cantidad - cantidad }, { transaction });
  return libro;
}

export async function returnStock(libroId: number, cantidad: number, transaction: Transaction): Promise<void> {
  const libro = await Libro.findByPk(libroId, { transaction, lock: transaction.LOCK.UPDATE });
  if (libro) await libro.update({ cantidad: libro.cantidad + cantidad }, { transaction });
}

/** Recalcula subtotal/total a partir de las líneas activas. */
export async function recalcTotals(prestamo: Prestamo, transaction: Transaction): Promise<Prestamo> {
  const lines = await DetallePrestamo.findAll({
    where: { prestamo_id: prestamo.id, status: "active" },
    transaction,
  });
  const subtotal = round2(lines.reduce((sum, line) => sum + Number(line.total_linea), 0));
  const total = round2(Math.max(0, subtotal + Number(prestamo.impuesto) - Number(prestamo.descuentos)));
  await prestamo.update({ subtotal, total }, { transaction });
  return prestamo;
}

export function withItems(id: number, transaction?: Transaction) {
  return Prestamo.findByPk(id, {
    include: [{ model: DetallePrestamo, as: "items" }],
    order: [[{ model: DetallePrestamo, as: "items" }, "id", "ASC"]],
    transaction,
  });
}

/** POST transaccional: cabecera + líneas + descuento de stock, todo o nada. */
export async function createPrestamo(input: PrestamoCreateInput) {
  const lectorId = positiveInt(input.lector_id, "lector_id");
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new HttpError(400, "El préstamo requiere al menos un libro", "items vacío");
  }

  // Una línea por libro: agrupa cantidades repetidas.
  const grouped = new Map<number, number>();
  for (const item of input.items) {
    const libroId = positiveInt(item?.libro_id, "items[].libro_id");
    grouped.set(libroId, (grouped.get(libroId) ?? 0) + positiveInt(item?.cantidad, "items[].cantidad"));
  }

  const impuesto = nonNegative(input.impuesto, "impuesto");
  const descuentos = nonNegative(input.descuentos, "descuentos");
  const fecha = parseDate(input.fecha_prestamo) ?? new Date();

  return sequelize.transaction(async (transaction) => {
    await activeLector(lectorId, transaction);

    const prestamo = await Prestamo.create(
      { lector_id: lectorId, impuesto, descuentos, fecha_prestamo: fecha, status: "active" },
      { transaction },
    );

    const items: DetallePrestamo[] = [];
    for (const [libroId, cantidad] of grouped) {
      const libro = await takeStock(libroId, cantidad, transaction);
      const precio = round2(Number(libro.precio_prestamo));
      items.push(
        await DetallePrestamo.create(
          {
            prestamo_id: prestamo.id,
            libro_id: libroId,
            cantidad,
            precio_unitario: precio,
            total_linea: round2(precio * cantidad),
            status: "active",
          },
          { transaction },
        ),
      );
    }

    await recalcTotals(prestamo, transaction);
    if (Number(prestamo.subtotal) + impuesto < descuentos) {
      throw new HttpError(400, "Los descuentos superan el valor del préstamo");
    }
    return { prestamo, items };
  });
}

/** PATCH de la cabecera: lector, fecha, impuesto, descuentos (recalcula el total). */
export async function updatePrestamo(id: number, data: Record<string, unknown>) {
  return sequelize.transaction(async (transaction) => {
    const prestamo = await Prestamo.findByPk(id, { transaction });
    if (!prestamo) throw notFound("Préstamo");

    const changes: Record<string, unknown> = {};
    if (data.lector_id !== undefined) {
      changes.lector_id = (await activeLector(positiveInt(data.lector_id, "lector_id"), transaction)).id;
    }
    if (data.impuesto !== undefined) changes.impuesto = nonNegative(data.impuesto, "impuesto");
    if (data.descuentos !== undefined) changes.descuentos = nonNegative(data.descuentos, "descuentos");
    const fecha = parseDate(data.fecha_prestamo);
    if (fecha) changes.fecha_prestamo = fecha;

    await prestamo.update(changes, { transaction });
    if (Number(prestamo.subtotal) + Number(prestamo.impuesto) < Number(prestamo.descuentos)) {
      throw new HttpError(400, "Los descuentos superan el valor del préstamo");
    }
    await recalcTotals(prestamo, transaction);
    return withItems(id, transaction);
  });
}

/** Cancelación: préstamo y líneas → inactive; se devuelven los ejemplares. */
export async function cancelPrestamo(id: number) {
  return sequelize.transaction(async (transaction) => {
    const prestamo = await Prestamo.findByPk(id, { transaction });
    if (!prestamo) throw notFound("Préstamo");
    if (prestamo.status === "inactive") throw new HttpError(409, "El préstamo ya está cancelado");

    const lines = await DetallePrestamo.findAll({ where: { prestamo_id: id, status: "active" }, transaction });
    for (const line of lines) {
      await returnStock(line.libro_id, line.cantidad, transaction);
      await line.update({ status: "inactive" }, { transaction });
    }
    await prestamo.update({ status: "inactive" }, { transaction });
    return withItems(id, transaction);
  });
}

/** DELETE físico: devuelve stock de líneas activas, borra líneas y luego la cabecera. */
export async function deletePrestamo(id: number) {
  return sequelize.transaction(async (transaction) => {
    const prestamo = await Prestamo.findByPk(id, { transaction });
    if (!prestamo) throw notFound("Préstamo");

    const lines = await DetallePrestamo.findAll({ where: { prestamo_id: id }, transaction });
    for (const line of lines) {
      if (line.status === "active") await returnStock(line.libro_id, line.cantidad, transaction);
      await line.destroy({ transaction });
    }
    await prestamo.destroy({ transaction });
  });
}
