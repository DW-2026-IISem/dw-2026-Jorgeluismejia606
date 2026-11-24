import { Money, Status, Timestamps } from '../../../core/models/api.model';

/** Tabla `libros` — /api/libros. `cantidad` = ejemplares disponibles (stock). */
export interface Libro extends Timestamps {
  id: number;
  titulo: string;
  autor: string;
  precio_prestamo: Money; // DECIMAL → puede llegar como string
  stock_minimo: number;
  cantidad: number;
  categoria_id: number;
  status: Status;
}

export interface LibroPayload {
  titulo: string;
  autor: string;
  precio_prestamo: number; // al escribir siempre es number
  stock_minimo: number;
  cantidad: number;
  categoria_id: number;
  status?: Status;
}
