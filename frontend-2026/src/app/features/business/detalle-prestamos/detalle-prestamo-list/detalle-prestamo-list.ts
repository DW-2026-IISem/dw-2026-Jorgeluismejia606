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
import { DetallePrestamo, DetallePrestamoPayload } from '../detalle-prestamo.model';
import { Libro } from '../../libros/libro.model';
import { Prestamo } from '../../prestamos/prestamo.model';
import { NotificationService } from '../../../../core/services/notification';
import { SessionStore } from '../../../../core/services/session-store';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermission } from '../../../../shared/directives/has-permission';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { LibroApi } from '../../libros/libro-api';
import { PrestamoApi } from '../../prestamos/prestamo-api';
import { DetallePrestamoApi } from '../detalle-prestamo-api';
import { DetallePrestamoForm } from '../detalle-prestamo-form/detalle-prestamo-form';

/**
 * Líneas de préstamo. El flujo normal es crear el préstamo completo
 * (`POST /api/prestamos`); esta pantalla corrige líneas: cada cambio ajusta
 * ejemplares y recalcula la cabecera en el backend.
 */
@Component({
  host: { class: 'block' },
  selector: 'app-detalle-prestamo-list',
  imports: [
    ButtonModule,
    CurrencyPipe,
    DetallePrestamoForm,
    DialogModule,
    EmptyState,
    HasPermission,
    InputTextModule,
    MessageModule,
    PageHeader,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './detalle-prestamo-list.html',
  styleUrl: './detalle-prestamo-list.css',
})
export class DetallePrestamoList {
  private readonly api = inject(DetallePrestamoApi);
  private readonly prestamosApi = inject(PrestamoApi);
  private readonly librosApi = inject(LibroApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<DetallePrestamo[]>([]);
  readonly prestamos = signal<Prestamo[]>([]);
  readonly libros = signal<Libro[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly libroTitulo = computed(() => {
    const map = new Map(this.libros().map((libro) => [libro.id, libro.titulo]));
    return (id: number) => map.get(id) ?? `Libro #${id}`;
  });

  readonly visibleRows = computed(() => {
    const titulo = this.libroTitulo();
    return filterRows(this.rows(), this.filter(), (row) => [
      `#${row.prestamo_id}`,
      titulo(row.libro_id),
    ]);
  });

  readonly dialogVisible = signal(false);
  readonly editing = signal<DetallePrestamo | null>(null);
  readonly resetKey = signal(0);
  readonly title = computed(() => (this.editing() ? 'Editar línea' : 'Agregar línea'));

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      lineas: this.api.list(),
      prestamos: this.session.canPermission('GET /api/prestamos')
        ? this.prestamosApi.list()
        : of([]),
      libros: this.session.canPermission('GET /api/libros') ? this.librosApi.list() : of([]),
    }).subscribe({
      next: ({ lineas, prestamos, libros }) => {
        this.rows.set(lineas);
        this.prestamos.set(prestamos);
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

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(row: DetallePrestamo): void {
    this.editing.set(row);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(value: DetallePrestamoPayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current
      ? this.api.update(current.id, { cantidad: value.cantidad })
      : this.api.create(value);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          current ? 'Línea actualizada' : 'Línea agregada',
          'Stock y totales recalculados.',
        );
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  deactivate(row: DetallePrestamo): void {
    this.confirmation.confirm({
      header: 'Retirar línea',
      message: `¿Retirar la línea #${row.id}? Los ejemplares vuelven al inventario.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () =>
        this.api.deactivate(row.id).subscribe({
          next: () => {
            this.notify.warn('Línea retirada');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo retirar', toApiMessage(error)),
        }),
    });
  }

  remove(row: DetallePrestamo): void {
    this.confirmation.confirm({
      header: 'Eliminar línea',
      message: `Se borrará la línea #${row.id}. Esta acción no se puede deshacer.`,
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () =>
        this.api.remove(row.id).subscribe({
          next: () => {
            this.notify.success('Línea eliminada');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo eliminar', toApiMessage(error)),
        }),
    });
  }
}
