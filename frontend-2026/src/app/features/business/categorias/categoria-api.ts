import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Categoria, CategoriaPayload } from './categoria.model';

/** /api/categorias — envolturas `{ categorias }` / `{ categoria }`. */
@Injectable({ providedIn: 'root' })
export class CategoriaApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categorias`;

  list(): Observable<Categoria[]> {
    return this.http
      .get<{ categorias: Categoria[] }>(this.base)
      .pipe(map((response) => response.categorias));
  }

  get(id: number): Observable<Categoria> {
    return this.http
      .get<{ categoria: Categoria }>(`${this.base}/${id}`)
      .pipe(map((response) => response.categoria));
  }

  create(payload: CategoriaPayload): Observable<Categoria> {
    return this.http
      .post<{ categoria: Categoria }>(this.base, payload)
      .pipe(map((response) => response.categoria));
  }

  /** PATCH /api/categorias/:id — actualización parcial (la que usa el formulario). */
  update(id: number, payload: Partial<CategoriaPayload>): Observable<Categoria> {
    return this.http
      .patch<{ categoria: Categoria }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.categoria));
  }

  /** PUT /api/categorias/:id — reemplazo completo. */
  replace(id: number, payload: CategoriaPayload): Observable<Categoria> {
    return this.http
      .put<{ categoria: Categoria }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.categoria));
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
