export type Status = 'active' | 'inactive';
/** DECIMAL(12,2) de Sequelize: según el driver llega como number o string. */
export type Money = number | string;

export interface ApiError {
  error: string;
  detail?: string;
}

/** Firma mínima de los objetos Sequelize que devuelve el backend. */
export interface Timestamps {
  createdAt?: string;
  updatedAt?: string;
}

/** Normaliza un DECIMAL a number (evita concatenar strings al sumar). */
export function toNumber(value: Money | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
