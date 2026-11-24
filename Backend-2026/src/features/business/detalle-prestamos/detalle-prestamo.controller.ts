import { Request, Response } from "express";
import { sequelize } from "../../../database/db";
import { HttpError, action, body, notFound, paramId } from "../../../shared/http";
import { Prestamo } from "../prestamos/prestamo.model";
import { positiveInt, recalcTotals, returnStock, round2, takeStock } from "../prestamos/prestamo.service";
import { DetallePrestamo } from "./detalle-prestamo.model";

/**
 * Detalle de préstamos (equivale a «detalle de ventas»).
 * Agregar, editar, desactivar o borrar una línea ajusta el stock y los totales.
 */
export class DetallePrestamoController {
  private async activePrestamo(id: number, transaction: import("sequelize").Transaction): Promise<Prestamo> {
    const prestamo = await Prestamo.findByPk(id, { transaction });
    if (!prestamo) throw new HttpError(400, "El préstamo no existe", `prestamo_id=${id}`);
    if (prestamo.status !== "active") throw new HttpError(409, "El préstamo está cancelado");
    return prestamo;
  }

  // ================== READ ==================
  getAll = action(async (_req: Request, res: Response) => {
    const detalle_prestamos = await DetallePrestamo.findAll({ order: [["prestamo_id", "DESC"], ["id", "ASC"]] });
    res.status(200).json({ detalle_prestamos });
  });

  getOne = action(async (req: Request, res: Response) => {
    const detalle_prestamo = await DetallePrestamo.findByPk(paramId(req));
    if (!detalle_prestamo) throw notFound("Detalle de préstamo");
    res.status(200).json({ detalle_prestamo });
  });

  // ================== CREATE ==================
  create = action(async (req: Request, res: Response) => {
    const data = body<{ prestamo_id: number; libro_id: number; cantidad: number }>(req);
    const prestamoId = positiveInt(data.prestamo_id, "prestamo_id");
    const libroId = positiveInt(data.libro_id, "libro_id");
    const cantidad = positiveInt(data.cantidad, "cantidad");

    const detalle_prestamo = await sequelize.transaction(async (transaction) => {
      const prestamo = await this.activePrestamo(prestamoId, transaction);
      const libro = await takeStock(libroId, cantidad, transaction);
      const precio = round2(Number(libro.precio_prestamo));
      const line = await DetallePrestamo.create(
        {
          prestamo_id: prestamoId,
          libro_id: libroId,
          cantidad,
          precio_unitario: precio,
          total_linea: round2(precio * cantidad),
          status: "active",
        },
        { transaction },
      );
      await recalcTotals(prestamo, transaction);
      return line;
    });
    res.status(201).json({ detalle_prestamo });
  });

  // ================== UPDATE ==================
  /** PATCH solo acepta `cantidad`; el estado se cambia con /deactivate. */
  updatePatch = action(async (req: Request, res: Response) => {
    const id = paramId(req);
    const cantidad = positiveInt(body<{ cantidad: number }>(req).cantidad, "cantidad");

    const detalle_prestamo = await sequelize.transaction(async (transaction) => {
      const line = await DetallePrestamo.findByPk(id, { transaction });
      if (!line) throw notFound("Detalle de préstamo");
      if (line.status !== "active") throw new HttpError(409, "La línea está inactiva");
      const prestamo = await this.activePrestamo(line.prestamo_id, transaction);

      const diff = cantidad - line.cantidad;
      if (diff > 0) await takeStock(line.libro_id, diff, transaction);
      if (diff < 0) await returnStock(line.libro_id, -diff, transaction);

      await line.update(
        { cantidad, total_linea: round2(Number(line.precio_unitario) * cantidad) },
        { transaction },
      );
      await recalcTotals(prestamo, transaction);
      return line;
    });
    res.status(200).json({ detalle_prestamo });
  });

  // ================== DELETE ==================
  deleteLogical = action(async (req: Request, res: Response) => {
    const id = paramId(req);
    const detalle_prestamo = await sequelize.transaction(async (transaction) => {
      const line = await DetallePrestamo.findByPk(id, { transaction });
      if (!line) throw notFound("Detalle de préstamo");
      if (line.status !== "active") throw new HttpError(409, "La línea ya está inactiva");
      const prestamo = await this.activePrestamo(line.prestamo_id, transaction);
      await returnStock(line.libro_id, line.cantidad, transaction);
      await line.update({ status: "inactive" }, { transaction });
      await recalcTotals(prestamo, transaction);
      return line;
    });
    res.status(200).json({ message: "Línea desactivada y ejemplares devueltos", detalle_prestamo });
  });

  deletePhysical = action(async (req: Request, res: Response) => {
    const id = paramId(req);
    await sequelize.transaction(async (transaction) => {
      const line = await DetallePrestamo.findByPk(id, { transaction });
      if (!line) throw notFound("Detalle de préstamo");
      const prestamo = await Prestamo.findByPk(line.prestamo_id, { transaction });
      if (line.status === "active") await returnStock(line.libro_id, line.cantidad, transaction);
      await line.destroy({ transaction });
      if (prestamo) await recalcTotals(prestamo, transaction);
    });
    res.status(200).json({ message: "Línea eliminada", id });
  });
}
