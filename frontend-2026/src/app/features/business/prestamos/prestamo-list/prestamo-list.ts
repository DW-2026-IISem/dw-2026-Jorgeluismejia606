import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Lector } from '../../lectores/lector.model';
import { Libro } from '../../libros/libro.model';
import { Prestamo } from '../prestamo.model';
import { NotificationService } from '../../../../core/services/notification';
import { SessionStore } from '../../../../core/services/session-store';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermission } from '../../../../shared/directives/has-permission';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { LectorApi } from '../../lectores/lector-api';
import { LibroApi } from '../../libros/libro-api';
import { PrestamoApi } from '../prestamo-api';
import { PrestamoDetail } from '../prestamo-detail/prestamo-detail';

/** Listado de préstamos: resuelve lector y libros con `forkJoin` y mapas. */
@Component({
  host: { class: 'block' },
  selector: 'app-prestamo-list',
  imports: [
    ButtonModule,
    CurrencyPipe,
    DatePipe,
    DialogModule,
    EmptyState,
    HasPermission,
    InputTextModule,
    MessageModule,
    PageHeader,
    PrestamoDetail,
    RouterLink,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './prestamo-list.html',
  styleUrl: './prestamo-list.css',
})
export class PrestamoList {
  private readonly api = inject(PrestamoApi);
  private readonly lectoresApi = inject(LectorApi);
  private readonly librosApi = inject(LibroApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Prestamo[]>([]);
  readonly lectores = signal<Lector[]>([]);
  readonly libros = signal<Libro[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly lectorNombre = computed(() => {
    const map = new Map(this.lectores().map((lector) => [lector.id, lector.nombre]));
    return (id: number) => map.get(id) ?? `Lector #${id}`;
  });

  readonly visibleRows = computed(() => {
    const nombre = this.lectorNombre();
    return filterRows(this.rows(), this.filter(), (row) => [row.id, nombre(row.lector_id)]);
  });

  readonly detailVisible = signal(false);
  readonly selected = signal<Prestamo | null>(null);
  readonly detailTitle = computed(() => `Préstamo #${this.selected()?.id ?? ''}`);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      prestamos: this.api.list(),
      lectores: this.session.canPermission('GET /api/lectores') ? this.lectoresApi.list() : of([]),
      libros: this.session.canPermission('GET /api/libros') ? this.librosApi.list() : of([]),
    }).subscribe({
      next: ({ prestamos, lectores, libros }) => {
        this.rows.set(prestamos);
        this.lectores.set(lectores);
        this.libros.set(libros);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  /** Ejemplares activos del préstamo. */
  ejemplares(prestamo: Prestamo): number {
    return (prestamo.items ?? [])
      .filter((item) => item.status === 'active')
      .reduce((sum, item) => sum + item.cantidad, 0);
  }

  openDetail(prestamo: Prestamo): void {
    this.selected.set(prestamo);
    this.detailVisible.set(true);
  }

  /** Cancelación (baja lógica): el backend restaura los ejemplares. */
  deactivate(prestamo: Prestamo): void {
    this.confirmation.confirm({
      header: 'Cancelar préstamo',
      message: `¿Cancelar el préstamo #${prestamo.id}? Los ejemplares vuelven al inventario.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar préstamo',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () =>
        this.api.deactivate(prestamo.id).subscribe({
          next: () => {
            this.notify.warn('Préstamo cancelado', 'Ejemplares restaurados.');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo cancelar', toApiMessage(error)),
        }),
    });
  }

  remove(prestamo: Prestamo): void {
    this.confirmation.confirm({
      header: 'Eliminar definitivamente',
      message: `Se borrará el préstamo #${prestamo.id} y sus líneas. Esta acción no se puede deshacer.`,
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () =>
        this.api.remove(prestamo.id).subscribe({
          next: () => {
            this.notify.success('Préstamo eliminado');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo eliminar', toApiMessage(error)),
        }),
    });
  }
}
