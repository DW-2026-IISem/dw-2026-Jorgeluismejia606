import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { toNumber } from '../../core/models/api.model';
import { Lector } from '../business/lectores/lector.model';
import { Libro } from '../business/libros/libro.model';
import { Prestamo } from '../business/prestamos/prestamo.model';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/api-error';
import { HasPermission } from '../../shared/directives/has-permission';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusTag } from '../../shared/ui/status-tag/status-tag';
import { CategoriaApi } from '../business/categorias/categoria-api';
import { LectorApi } from '../business/lectores/lector-api';
import { LibroApi } from '../business/libros/libro-api';
import { PrestamoApi } from '../business/prestamos/prestamo-api';

/**
 * Panel: agrega las listas de negocio con `forkJoin` y deriva los KPIs con
 * `computed`. No existe `GET /api/dashboard`: si el usuario no puede leer una
 * fuente se pide `of([])` en vez de provocar un 403.
 */
@Component({
  host: { class: 'block' },
  selector: 'app-dashboard',
  imports: [
    ButtonModule,
    CardModule,
    CurrencyPipe,
    DatePipe,
    HasPermission,
    MessageModule,
    PageHeader,
    RouterLink,
    SkeletonModule,
    StatusTag,
    TableModule,
    TagModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly lectoresApi = inject(LectorApi);
  private readonly categoriasApi = inject(CategoriaApi);
  private readonly librosApi = inject(LibroApi);
  private readonly prestamosApi = inject(PrestamoApi);
  protected readonly session = inject(SessionStore);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly lectores = signal<Lector[]>([]);
  readonly libros = signal<Libro[]>([]);
  readonly prestamos = signal<Prestamo[]>([]);
  readonly categoriaCount = signal(0);

  /** Mismo criterio que la lista de libros: `cantidad <= stock_minimo`. */
  readonly stockBajo = computed(() =>
    this.libros().filter((libro) => libro.cantidad <= libro.stock_minimo),
  );

  readonly ingresos = computed(() =>
    this.prestamos().reduce((sum, p) => sum + toNumber(p.total), 0),
  );

  readonly ultimosPrestamos = computed(() =>
    [...this.prestamos()]
      .sort((a, b) => new Date(b.fecha_prestamo).getTime() - new Date(a.fecha_prestamo).getTime())
      .slice(0, 5),
  );

  readonly lectorNombre = computed(() => {
    const map = new Map(this.lectores().map((lector) => [lector.id, lector.nombre]));
    return (id: number) => map.get(id) ?? `Lector #${id}`;
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const can = (permission: string) => this.session.canPermission(permission);
    forkJoin({
      lectores: can('GET /api/lectores') ? this.lectoresApi.list() : of([]),
      categorias: can('GET /api/categorias') ? this.categoriasApi.list() : of([]),
      libros: can('GET /api/libros') ? this.librosApi.list() : of([]),
      prestamos: can('GET /api/prestamos') ? this.prestamosApi.list() : of([]),
    }).subscribe({
      next: ({ lectores, categorias, libros, prestamos }) => {
        this.lectores.set(lectores);
        this.categoriaCount.set(categorias.length);
        this.libros.set(libros);
        this.prestamos.set(prestamos);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }
}
