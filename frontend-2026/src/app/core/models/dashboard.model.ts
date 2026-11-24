import { Libro } from '../../features/business/libros/libro.model';
import { Prestamo } from '../../features/business/prestamos/prestamo.model';

export interface DashboardStats {
  lectores: number;
  categorias: number;
  libros: number;
  stockBajo: number;
  prestamos: number;
  ingresos: number;
}

export interface DashboardData {
  stats: DashboardStats;
  librosStockBajo: Libro[];
  ultimosPrestamos: Prestamo[];
}
