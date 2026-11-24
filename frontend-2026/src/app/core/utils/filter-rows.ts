/**
 * Filtro local reutilizable para tablas PrimeNG 22 (que eliminó `globalFilter`).
 * Función pura: se prueba sin montar nada.
 */
export function filterRows<T>(
  rows: readonly T[],
  query: string,
  pick: (row: T) => Array<string | number | null | undefined>,
): T[] {
  const term = query.trim().toLowerCase();
  if (!term) {
    return [...rows];
  }
  return rows.filter((row) =>
    pick(row).some((value) => (value ?? '').toString().toLowerCase().includes(term)),
  );
}
