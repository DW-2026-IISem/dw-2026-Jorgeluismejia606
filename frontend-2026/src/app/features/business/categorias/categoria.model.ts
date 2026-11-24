import { Status, Timestamps } from '../../../core/models/api.model';

/** Tabla `categorias` — /api/categorias */
export interface Categoria extends Timestamps {
  id: number;
  nombre: string;
  descripcion: string | null;
  status: Status;
}

export interface CategoriaPayload {
  nombre: string;
  descripcion?: string | null;
  status?: Status;
}
