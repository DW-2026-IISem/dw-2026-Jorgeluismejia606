import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { DetallePrestamo, DetallePrestamoPayload } from '../detalle-prestamo.model';
import { Libro } from '../../libros/libro.model';
import { Prestamo } from '../../prestamos/prestamo.model';

/**
 * Formulario de línea. Al editar solo se permite `cantidad`: el backend no
 * actualiza préstamo, libro ni estado por PATCH (el estado va por /deactivate).
 */
@Component({
  host: { class: 'block' },
  selector: 'app-detalle-prestamo-form',
  imports: [ButtonModule, InputNumberModule, MessageModule, ReactiveFormsModule, SelectModule],
  templateUrl: './detalle-prestamo-form.html',
  styleUrl: './detalle-prestamo-form.css',
})
export class DetallePrestamoForm {
  readonly line = input<DetallePrestamo | null>(null);
  readonly prestamos = input<Prestamo[]>([]);
  readonly libros = input<Libro[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<DetallePrestamoPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    prestamo_id: [null as number | null, [Validators.required]],
    libro_id: [null as number | null, [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      const current = this.line();
      this.resetKey();
      this.form.reset({
        prestamo_id: current?.prestamo_id ?? null,
        libro_id: current?.libro_id ?? null,
        cantidad: current?.cantidad ?? 1,
      });
      if (current) {
        this.form.controls.prestamo_id.disable();
        this.form.controls.libro_id.disable();
      } else {
        this.form.controls.prestamo_id.enable();
        this.form.controls.libro_id.enable();
      }
    });
  }

  submit(): void {
    const value = this.form.getRawValue();
    if (this.form.invalid || value.prestamo_id === null || value.libro_id === null) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit({
      prestamo_id: value.prestamo_id,
      libro_id: value.libro_id,
      cantidad: Number(value.cantidad),
    });
  }
}
