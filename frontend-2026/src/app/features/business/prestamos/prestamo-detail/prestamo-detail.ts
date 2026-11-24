import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Libro } from '../../libros/libro.model';
import { Prestamo } from '../prestamo.model';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';

/** Presentacional: cabecera + líneas de un préstamo ya cargado. No llama a la API. */
@Component({
  host: { class: 'block' },
  selector: 'app-prestamo-detail',
  imports: [CurrencyPipe, DatePipe, StatusTag, TableModule],
  templateUrl: './prestamo-detail.html',
  styleUrl: './prestamo-detail.css',
})
export class PrestamoDetail {
  readonly prestamo = input.required<Prestamo>();
  readonly libros = input<Libro[]>([]);
  readonly lectorNombre = input('');

  readonly libroTitulo = computed(() => {
    const map = new Map(this.libros().map((libro) => [libro.id, libro.titulo]));
    return (id: number) => map.get(id) ?? `Libro #${id}`;
  });

  readonly itemCount = computed(() =>
    (this.prestamo().items ?? [])
      .filter((item) => item.status === 'active')
      .reduce((sum, item) => sum + item.cantidad, 0),
  );
}
