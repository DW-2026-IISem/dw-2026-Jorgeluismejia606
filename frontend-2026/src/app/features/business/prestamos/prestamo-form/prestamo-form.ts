import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { toNumber } from '../../../../core/models/api.model';
import { Lector } from '../../lectores/lector.model';
import { Libro } from '../../libros/libro.model';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { LectorApi } from '../../lectores/lector-api';
import { LibroApi } from '../../libros/libro-api';
import { PrestamoApi } from '../prestamo-api';

/** Una línea del borrador: el precio y el total los calcula Express al guardar. */
export type DraftLine = { libro_id: number; cantidad: number };

/**
 * Registro de préstamo (ISS-06). El borrador vive en memoria (signals): añadir
 * líneas no toca el stock del servidor hasta confirmar con un único
 * `POST /api/prestamos` transaccional.
 */
@Component({
  host: { class: 'block' },
  selector: 'app-prestamo-form',
  imports: [
    ButtonModule,
    CardModule,
    CurrencyPipe,
    FormsModule,
    InputNumberModule,
    MessageModule,
    PageHeader,
    RouterLink,
    SelectModule,
    TableModule,
  ],
  templateUrl: './prestamo-form.html',
  styleUrl: './prestamo-form.css',
})
export class PrestamoForm {
  private readonly api = inject(PrestamoApi);
  private readonly lectoresApi = inject(LectorApi);
  private readonly librosApi = inject(LibroApi);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly lectores = signal<Lector[]>([]);
  readonly libros = signal<Libro[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly lectorId = signal<number | null>(null);
  readonly impuesto = signal(0);
  readonly descuentos = signal(0);

  readonly lines = signal<DraftLine[]>([]);
  readonly selectedLibroId = signal<number | null>(null);
  readonly cantidad = signal(1);

  readonly libroById = computed(() => new Map(this.libros().map((libro) => [libro.id, libro])));

  /** Subtotal desde el precio actual del libro (DECIMAL → `toNumber`). */
  readonly subtotal = computed(() =>
    this.lines().reduce(
      (sum, line) =>
        sum + toNumber(this.libroById().get(line.libro_id)?.precio_prestamo) * line.cantidad,
      0,
    ),
  );

  readonly total = computed(
    () => this.subtotal() + Number(this.impuesto() ?? 0) - Number(this.descuentos() ?? 0),
  );

  readonly canSave = computed(
    () => this.lectorId() !== null && this.lines().length > 0 && !this.saving(),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ lectores: this.lectoresApi.list(), libros: this.librosApi.list() }).subscribe({
      next: ({ lectores, libros }) => {
        this.lectores.set(lectores);
        this.libros.set(libros);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  lineTotal(line: DraftLine): number {
    return toNumber(this.libroById().get(line.libro_id)?.precio_prestamo) * line.cantidad;
  }

  /** Validación preventiva de stock; el backend vuelve a validar en la transacción. */
  addLine(): void {
    const libroId = this.selectedLibroId();
    const requested = Number(this.cantidad());
    this.error.set(null);

    if (libroId === null) {
      this.error.set('Selecciona un libro.');
      return;
    }
    if (!Number.isFinite(requested) || requested < 1) {
      this.error.set('La cantidad debe ser al menos 1.');
      return;
    }
    const libro = this.libroById().get(libroId);
    if (!libro) {
      return;
    }

    const already = this.lines()
      .filter((line) => line.libro_id === libroId)
      .reduce((sum, line) => sum + line.cantidad, 0);

    if (already + requested > libro.cantidad) {
      this.error.set(
        `Ejemplares insuficientes de «${libro.titulo}»: disponibles ${libro.cantidad}, solicitados ${already + requested}.`,
      );
      return;
    }

    // Agrupa líneas del mismo libro: una línea por libro_id.
    this.lines.update((lines) =>
      lines.some((line) => line.libro_id === libroId)
        ? lines.map((line) =>
            line.libro_id === libroId ? { ...line, cantidad: line.cantidad + requested } : line,
          )
        : [...lines, { libro_id: libroId, cantidad: requested }],
    );

    this.selectedLibroId.set(null);
    this.cantidad.set(1);
  }

  removeLine(index: number): void {
    this.lines.update((lines) => lines.filter((_, i) => i !== index));
  }

  save(): void {
    const lectorId = this.lectorId();
    if (lectorId === null) {
      this.error.set('Selecciona un lector activo.');
      return;
    }
    if (this.lines().length === 0) {
      this.error.set('El préstamo requiere al menos un libro.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.api
      .create({
        lector_id: lectorId,
        impuesto: Number(this.impuesto() ?? 0),
        descuentos: Number(this.descuentos() ?? 0),
        items: this.lines(),
      })
      .subscribe({
        next: (prestamo) => {
          this.saving.set(false);
          this.notify.success(
            `Préstamo #${prestamo.id} registrado`,
            'Ejemplares y totales actualizados.',
          );
          void this.router.navigate(['/prestamos']);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          const message = toApiMessage(error);
          this.error.set(message);
          this.notify.error('El préstamo no se registró', message);
        },
      });
  }
}
