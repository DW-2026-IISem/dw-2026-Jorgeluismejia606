import { Status, Timestamps } from '../../../core/models/api.model';

/** Tabla `lectores` — /api/lectores. Nunca incluye `password`. */
export interface Lector extends Timestamps {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  status: Status;
}

/** El backend acepta `password` en Lector, pero la UI del panel no lo usa. */
export interface LectorPayload {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  status?: Status;
}
