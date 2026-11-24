import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Lector, LectorPayload } from './lector.model';

/** Contrato exacto de `features/business/lectores` en Express: `{ lectores }` / `{ lector }`. */
@Injectable({ providedIn: 'root' })
export class LectorApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/lectores`;

  list(): Observable<Lector[]> {
    return this.http
      .get<{ lectores: Lector[] }>(this.base)
      .pipe(map((response) => response.lectores));
  }

  get(id: number): Observable<Lector> {
    return this.http
      .get<{ lector: Lector }>(`${this.base}/${id}`)
      .pipe(map((response) => response.lector));
  }

  create(payload: LectorPayload): Observable<Lector> {
    return this.http
      .post<{ lector: Lector }>(this.base, payload)
      .pipe(map((response) => response.lector));
  }

  /** PATCH /api/lectores/:id — actualización parcial (la que usa el formulario). */
  update(id: number, payload: Partial<LectorPayload>): Observable<Lector> {
    return this.http
      .patch<{ lector: Lector }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.lector));
  }

  /** PUT /api/lectores/:id — reemplazo completo. */
  replace(id: number, payload: LectorPayload): Observable<Lector> {
    return this.http
      .put<{ lector: Lector }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.lector));
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
