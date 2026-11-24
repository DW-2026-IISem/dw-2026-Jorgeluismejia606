import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Categoria } from '../../categorias/categoria.model';
import { Libro, LibroPayload } from '../libro.model';
import { NotificationService } from '../../../../core/services/notification';
import { SessionStore } from '../../../../core/services/session-store';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermission } from '../../../../shared/directives/has-permission';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { CategoriaApi } from '../../categorias/categoria-api';
import { LibroApi } from '../libro-api';
import { LibroForm } from '../libro-form/libro-form';

export type StockSeverity = 'danger' | 'warn' | 'success';

/** Semáforo: agotado (danger), reponer (warn), saludable (success). */
export function stockSeverity(libro: Pick<Libro, 'cantidad' | 'stock_minimo'>): StockSeverity {
  if (libro.cantidad === 0) return 'danger';
  if (libro.cantidad <= libro.stock_minimo) return 'warn';
  return 'success';
}

/** Lista de libros: primera relación many-to-one (Libro → Categoría). */
@Component({
  host: { class: 'block' },
  selector: 'app-libro-list',
  imports: [
    ButtonModule,
    CurrencyPipe,
    DialogModule,
    EmptyState,
    HasPermission,
    InputTextModule,
    LibroForm,
    MessageModule,
    PageHeader,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './libro-list.html',
  styleUrl: './libro-list.css',
})
export class LibroList {
  private readonly api = inject(LibroApi);
  private readonly categoriasApi = inject(CategoriaApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Libro[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  /** Mapa id → nombre, reconstruido solo cuando cambian las categorías. */
  readonly categoriaNombre = computed(() => {
    const map = new Map(this.categorias().map((categoria) => [categoria.id, categoria.nombre]));
    return (id: number) => map.get(id) ?? `Categoría #${id}`;
  });

  readonly visibleRows = computed(() => {
    const nombre = this.categoriaNombre();
    return filterRows(this.rows(), this.filter(), (row) => [
      row.titulo,
      row.autor,
      nombre(row.categoria_id),
    ]);
  });

  readonly lowStockCount = computed(
    () => this.rows().filter((libro) => libro.cantidad <= libro.stock_minimo).length,
  );

  readonly dialogVisible = signal(false);
  readonly editing = signal<Libro | null>(null);
  readonly resetKey = signal(0);
  readonly title = computed(() => (this.editing() ? 'Editar libro' : 'Nuevo libro'));

  protected readonly stockSeverity = stockSeverity;

  constructor() {
    this.load();
  }

  /** Libros y categorías en paralelo con `forkJoin`. */
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      libros: this.api.list(),
      // BIBLIOTECARIO no tiene GET /api/categorias: evita un 403 evitable.
      categorias: this.session.canPermission('GET /api/categorias')
        ? this.categoriasApi.list()
        : of([]),
    }).subscribe({
      next: ({ libros, categorias }) => {
        this.rows.set(libros);
        this.categorias.set(categorias);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(row: Libro): void {
    this.editing.set(row);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: LibroPayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current ? this.api.update(current.id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Libro actualizado' : 'Libro creado');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  deactivate(row: Libro): void {
    this.confirmation.confirm({
      header: 'Baja lógica',
      message: `¿Desactivar «${row.titulo}»? Dejará de estar disponible para préstamo.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () =>
        this.api.deactivate(row.id).subscribe({
          next: () => {
            this.notify.warn('Libro desactivado');
            this.load();
          },
          error: (error: unknown) =>
            this.notify.error('No se pudo desactivar', toApiMessage(error)),
        }),
    });
  }

  remove(row: Libro): void {
    this.confirmation.confirm({
      header: 'Eliminar definitivamente',
      message: `Se borrará «${row.titulo}». Esta acción no se puede deshacer.`,
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () =>
        this.api.remove(row.id).subscribe({
          next: () => {
            this.notify.success('Libro eliminado');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo eliminar', toApiMessage(error)),
        }),
    });
  }
}
