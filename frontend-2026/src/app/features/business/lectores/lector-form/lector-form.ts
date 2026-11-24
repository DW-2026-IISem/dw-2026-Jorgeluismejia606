import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Status } from '../../../../core/models/api.model';
import { Lector, LectorPayload } from '../lector.model';

/**
 * Formulario de lector, reutilizado para crear y editar. No llama a la API:
 * emite el payload con `saved` y el padre decide entre POST y PATCH.
 */
@Component({
  host: { class: 'block' },
  selector: 'app-lector-form',
  imports: [
    MessageModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './lector-form.html',
  styleUrl: './lector-form.css',
})
export class LectorForm {
  /** Lector a editar. `null` deja el formulario en modo creación. */
  readonly lector = input<Lector | null>(null);

  /** Cambia en cada apertura del diálogo: obliga a reiniciar el formulario. */
  readonly resetKey = input(0);

  readonly saving = input(false);

  readonly saved = output<LectorPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    direccion: [''],
    telefono: [''],
    email: ['', [Validators.email]],
    status: ['active' as Status, [Validators.required]],
  });

  constructor() {
    effect(() => {
      const current = this.lector();
      this.resetKey(); // reabrir el diálogo debe vaciar el formulario

      this.form.reset({
        nombre: current?.nombre ?? '',
        direccion: current?.direccion ?? '',
        telefono: current?.telefono ?? '',
        email: current?.email ?? '',
        status: current?.status ?? 'active',
      });

      // El estado de un lector existente solo cambia con PATCH /deactivate.
      if (current) {
        this.form.controls.status.disable();
      } else {
        this.form.controls.status.enable();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: LectorPayload = {
      nombre: value.nombre.trim(),
      direccion: value.direccion.trim() || null,
      telefono: value.telefono.trim() || null,
      email: value.email.trim() || null,
    };

    // `status` solo se envía al crear.
    this.saved.emit(this.lector() ? payload : { ...payload, status: value.status });
  }
}
