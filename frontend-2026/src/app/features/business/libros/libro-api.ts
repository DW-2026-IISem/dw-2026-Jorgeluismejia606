import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Libro, LibroPayload } from './libro.model';

/** /api/libros — el backend valida que la Categoría esté activa. */
@Injectable({ providedIn: 'root' })
export class LibroApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/libros`;

  list(): Observable<Libro[]> {
    return this.http.get<{ libros: Libro[] }>(this.base).pipe(map((response) => response.libros));
  }

  get(id: number): Observable<Libro> {
    return this.http
      .get<{ libro: Libro }>(`${this.base}/${id}`)
      .pipe(map((response) => response.libro));
  }

  create(payload: LibroPayload): Observable<Libro> {
    return this.http
      .post<{ libro: Libro }>(this.base, payload)
      .pipe(map((response) => response.libro));
  }

  /** PATCH /api/libros/:id — actualización parcial (la que usa el formulario). */
  update(id: number, payload: Partial<LibroPayload>): Observable<Libro> {
    return this.http
      .patch<{ libro: Libro }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.libro));
  }

  /** PUT /api/libros/:id — reemplazo completo. */
  replace(id: number, payload: LibroPayload): Observable<Libro> {
    return this.http
      .put<{ libro: Libro }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.libro));
  }

  /** Baja lógica: status = inactive. */
  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  /** Baja física: DELETE. */
  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
