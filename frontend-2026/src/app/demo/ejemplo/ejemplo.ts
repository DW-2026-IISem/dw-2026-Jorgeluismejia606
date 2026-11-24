import { Component, computed, effect, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

/**
 * Material de aprendizaje de ISS-01: un objeto en un signal, dos valores
 * derivados con `computed` y un `effect`. No es una pantalla de negocio: no
 * tiene ruta ni aparece en el menú.
 *
 * El objeto es un libro del catálogo de LecturaAbierta.
 */
export interface Libro {
  titulo: string;
  precio: number;
  activo: boolean;
}

@Component({
  host: { class: 'block' },
  selector: 'app-ejemplo',
  imports: [ButtonModule, CardModule, InputTextModule, MessageModule, TagModule],
  templateUrl: './ejemplo.html',
  styleUrl: './ejemplo.css',
})
export class Ejemplo {
  // ESTADO: el signal guarda un objeto completo.
  protected readonly libro = signal<Libro>(libroInicial());

  // DERIVADOS: se calculan desde `libro()`, nunca se asignan.
  protected readonly precioFinal = computed(() => Math.round(this.libro().precio * 1.19));
  protected readonly estadoTexto = computed(() => (this.libro().activo ? 'Activo' : 'Inactivo'));

  // EFECTO: se ejecuta al crear y en cada cambio del objeto.
  private readonly registro = effect(() => {
    const { titulo, precio, activo } = this.libro();
    console.log(`[ejemplo] ${titulo} · precio ${precio} · ${activo ? 'activo' : 'inactivo'}`);
  });

  protected cambiarTitulo(event: Event): void {
    const titulo = (event.target as HTMLInputElement).value;
    this.libro.update((actual) => ({ ...actual, titulo }));
  }

  protected variarPrecio(delta: number): void {
    this.libro.update((actual) => ({ ...actual, precio: Math.max(0, actual.precio + delta) }));
  }

  protected alternarEstado(): void {
    this.libro.update((actual) => ({ ...actual, activo: !actual.activo }));
  }

  protected reiniciar(): void {
    this.libro.set(libroInicial());
  }
}

/** Crea un objeto nuevo en cada llamada: el reinicio no comparte referencia. */
function libroInicial(): Libro {
  return { titulo: 'Cien años de soledad', precio: 18000, activo: true };
}
