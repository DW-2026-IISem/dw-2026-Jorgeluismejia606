import { Money, Status, Timestamps } from '../../../core/models/api.model';

/** Tabla `detalle_prestamos` — /api/detalle-prestamos */
export interface DetallePrestamo extends Timestamps {
  id: number;
  prestamo_id: number;
  libro_id: number;
  cantidad: number;
  precio_unitario: Money;
  total_linea: Money;
  status: Status;
}

export interface DetallePrestamoPayload {
  prestamo_id: number;
  libro_id: number;
  cantidad: number;
  status?: Status;
}
