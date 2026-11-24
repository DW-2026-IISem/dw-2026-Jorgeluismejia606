import { Money, Status, Timestamps } from '../../../core/models/api.model';
import { DetallePrestamo } from '../detalle-prestamos/detalle-prestamo.model';

/** Tabla `prestamos` — /api/prestamos (cabecera). */
export interface Prestamo extends Timestamps {
  id: number;
  fecha_prestamo: string;
  subtotal: Money;
  impuesto: Money;
  descuentos: Money;
  total: Money;
  lector_id: number;
  status: Status;
  /** El backend incluye el detalle con `include: [{ model: DetallePrestamo, as: 'items' }]`. */
  items?: DetallePrestamo[];
}

export interface PrestamoItemInput {
  libro_id: number;
  cantidad: number;
}

/** Sin precios ni totales: los calcula Express con el precio real y el stock. */
export interface PrestamoCreatePayload {
  lector_id: number;
  impuesto?: number;
  descuentos?: number;
  fecha_prestamo?: string;
  items: PrestamoItemInput[];
}

export interface PrestamoUpdatePayload {
  lector_id?: number;
  impuesto?: number;
  descuentos?: number;
  fecha_prestamo?: string;
}
