export type SeedCounts = {
  lectores: number;
  categorias: number;
  libros: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  lectores: 10,
  categorias: 5,
  libros: 15,
};

export function resolveSeedCounts(argv: string[] = process.argv.slice(2)): SeedCounts {
  const counts: SeedCounts = { ...DEFAULT_SEED_COUNTS };

  if (process.env.SEED_LECTORES) counts.lectores = Number(process.env.SEED_LECTORES);
  if (process.env.SEED_CATEGORIAS) counts.categorias = Number(process.env.SEED_CATEGORIAS);
  if (process.env.SEED_LIBROS) counts.libros = Number(process.env.SEED_LIBROS);

  for (const arg of argv) {
    const match = arg.match(/^--([a-zA-Z_]+)=(\d+)$/);
    if (!match) continue;
    const key = match[1] as keyof SeedCounts;
    const value = Number(match[2]);
    if (key in counts) counts[key] = value;
  }

  return counts;
}
