import { filterRows } from './filter-rows';

type Fila = { nombre: string; email: string | null; telefono?: string | null };

const FILAS: Fila[] = [
  { nombre: 'Ana Pérez', email: 'ana@correo.com', telefono: '300' },
  { nombre: 'Luis Gómez', email: null, telefono: null },
  { nombre: 'María Sur', email: 'maria@sur.com' },
];
const pick = (fila: Fila) => [fila.nombre, fila.email, fila.telefono];

describe('filterRows', () => {
  it('returns a copy when there is no term', () => {
    const resultado = filterRows(FILAS, '  ', pick);
    expect(resultado).toEqual(FILAS);
    expect(resultado).not.toBe(FILAS);
  });

  it('is case insensitive', () => {
    expect(filterRows(FILAS, 'ANA', pick)).toHaveLength(1);
  });

  it('tolerates null values', () => {
    expect(filterRows(FILAS, 'luis', pick)).toHaveLength(1);
  });

  it('searches any picked field', () => {
    expect(filterRows(FILAS, 'sur.com', pick)[0].nombre).toBe('María Sur');
  });

  it('returns empty when nothing matches', () => {
    expect(filterRows(FILAS, 'zzz', pick)).toEqual([]);
  });
});
