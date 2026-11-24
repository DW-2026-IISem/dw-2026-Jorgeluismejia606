import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NestResponse } from '../../core/models/api.model';
import { Categoria, CategoriaPayload } from '../../core/models/categoria.model';

/**
 * /api/categorias — backend NestJS de Lectura Abierta.
 * Todas las respuestas llegan como { statusCode, message, data, timestamp }:
 * el servicio desenvuelve `data` para que el componente reciba la entidad.
 */
@Injectable({ providedIn: 'root' })
export class CategoriaApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categorias`;

  list(): Observable<Categoria[]> {
    return this.http
      .get<NestResponse<Categoria[]>>(this.base)
      .pipe(map((r) => r.data));
  }

  get(id: number): Observable<Categoria> {
    return this.http
      .get<NestResponse<Categoria>>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }

  create(payload: CategoriaPayload): Observable<Categoria> {
    return this.http
      .post<NestResponse<Categoria>>(this.base, payload)
      .pipe(map((r) => r.data));
  }

  /** PATCH /api/categorias/:id — actualización parcial. */
  update(id: number, payload: Partial<CategoriaPayload>): Observable<Categoria> {
    return this.http
      .patch<NestResponse<Categoria>>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  /** Baja lógica: is_active = false. */
  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  /** Baja física: DELETE. */
  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
