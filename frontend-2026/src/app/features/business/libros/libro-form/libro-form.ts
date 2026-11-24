import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Status } from '../../../../core/models/api.model';
import { Categoria } from '../../categorias/categoria.model';
import { Libro, LibroPayload } from '../libro.model';

/** Formulario de libro. `optionValue="id"` guarda `categoria_id` como number. */
@Component({
  host: { class: 'block' },
  selector: 'app-libro-form',
  imports: [
    MessageModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './libro-form.html',
  styleUrl: './libro-form.css',
})
export class LibroForm {
  readonly libro = input<Libro | null>(null);
  readonly categorias = input<Categoria[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<LibroPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    autor: ['', [Validators.required, Validators.maxLength(150)]],
    precio_prestamo: [0, [Validators.required, Validators.min(0.01)]],
    stock_minimo: [0, [Validators.required, Validators.min(0)]],
    cantidad: [0, [Validators.required, Validators.min(0)]],
    categoria_id: [null as number | null, [Validators.required]],
    status: ['active' as Status, [Validators.required]],
  });

  constructor() {
    effect(() => {
      const current = this.libro();
      this.resetKey();
      this.form.reset({
        titulo: current?.titulo ?? '',
        autor: current?.autor ?? '',
        precio_prestamo: Number(current?.precio_prestamo ?? 0),
        stock_minimo: current?.stock_minimo ?? 0,
        cantidad: current?.cantidad ?? 0,
        categoria_id: current?.categoria_id ?? null,
        status: current?.status ?? 'active',
      });
      if (current) {
        this.form.controls.status.disable();
      } else {
        this.form.controls.status.enable();
      }
    });
  }

  submit(): void {
    const value = this.form.getRawValue();
    if (this.form.invalid || value.categoria_id === null) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit({
      titulo: value.titulo.trim(),
      autor: value.autor.trim(),
      precio_prestamo: Number(value.precio_prestamo),
      stock_minimo: Number(value.stock_minimo),
      cantidad: Number(value.cantidad),
      categoria_id: value.categoria_id,
      ...(this.libro() ? {} : { status: value.status }),
    });
  }
}
