import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Resource, ResourcePayload } from '../../../core/models/resource.model';

/** /api/recursos — catálogo de pares (method, path). */
@Injectable({ providedIn: 'root' })
export class ResourceApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/recursos`;

  list(): Observable<Resource[]> {
    return this.http
      .get<{ resources: Resource[] }>(this.base)
      .pipe(map((response) => response.resources));
  }

  get(id: number): Observable<Resource> {
    return this.http
      .get<{ resource: Resource }>(`${this.base}/${id}`)
      .pipe(map((response) => response.resource));
  }

  create(payload: ResourcePayload): Observable<Resource> {
    return this.http
      .post<{ resource: Resource }>(this.base, payload)
      .pipe(map((response) => response.resource));
  }

  /** PATCH /api/recursos/:id — actualización parcial (la que usa el formulario). */
  update(id: number, payload: Partial<ResourcePayload>): Observable<Resource> {
    return this.http
      .patch<{ resource: Resource }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.resource));
  }

  /** PUT /api/recursos/:id — reemplazo completo. */
  replace(id: number, payload: ResourcePayload): Observable<Resource> {
    return this.http
      .put<{ resource: Resource }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.resource));
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
