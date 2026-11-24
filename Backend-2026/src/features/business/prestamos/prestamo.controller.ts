import { Request, Response } from "express";
import { DetallePrestamo } from "../detalle-prestamos/detalle-prestamo.model";
import { action, body, notFound, paramId } from "../../../shared/http";
import { Prestamo } from "./prestamo.model";
import {
  PrestamoCreateInput,
  cancelPrestamo,
  createPrestamo,
  deletePrestamo,
  updatePrestamo,
  withItems,
} from "./prestamo.service";

/** Préstamos (cabecera). Incluye siempre el detalle como `items`. */
export class PrestamoController {
  // ================== READ ==================
  getAll = action(async (_req: Request, res: Response) => {
    const prestamos = await Prestamo.findAll({
      include: [{ model: DetallePrestamo, as: "items" }],
      order: [
        ["fecha_prestamo", "DESC"],
        ["id", "DESC"],
        [{ model: DetallePrestamo, as: "items" }, "id", "ASC"],
      ],
    });
    res.status(200).json({ prestamos });
  });

  getOne = action(async (req: Request, res: Response) => {
    const prestamo = await withItems(paramId(req));
    if (!prestamo) throw notFound("Préstamo");
    res.status(200).json({ prestamo });
  });

  // ================== CREATE ==================
  /** Transaccional: responde `{ prestamo, items }` con el stock ya descontado. */
  create = action(async (req: Request, res: Response) => {
    const { prestamo, items } = await createPrestamo(body<PrestamoCreateInput>(req) as PrestamoCreateInput);
    res.status(201).json({ prestamo, items });
  });

  // ================== UPDATE ==================
  updatePatch = action(async (req: Request, res: Response) => {
    const prestamo = await updatePrestamo(paramId(req), body(req));
    res.status(200).json({ prestamo });
  });

  // ================== DELETE ==================
  deletePhysical = action(async (req: Request, res: Response) => {
    const id = paramId(req);
    await deletePrestamo(id);
    res.status(200).json({ message: "Préstamo eliminado y ejemplares devueltos", id });
  });

  deleteLogical = action(async (req: Request, res: Response) => {
    const prestamo = await cancelPrestamo(paramId(req));
    res.status(200).json({ message: "Préstamo cancelado y ejemplares devueltos", prestamo });
  });
}
