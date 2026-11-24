import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Role, RolePayload } from '../../../core/models/role.model';

/** /api/roles — el backend normaliza `name` a MAYÚSCULAS. */
@Injectable({ providedIn: 'root' })
export class RoleApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/roles`;

  list(): Observable<Role[]> {
    return this.http.get<{ roles: Role[] }>(this.base).pipe(map((response) => response.roles));
  }

  get(id: number): Observable<Role> {
    return this.http
      .get<{ role: Role }>(`${this.base}/${id}`)
      .pipe(map((response) => response.role));
  }

  create(payload: RolePayload): Observable<Role> {
    return this.http
      .post<{ role: Role }>(this.base, payload)
      .pipe(map((response) => response.role));
  }

  /** PATCH /api/roles/:id — actualización parcial (la que usa el formulario). */
  update(id: number, payload: Partial<RolePayload>): Observable<Role> {
    return this.http
      .patch<{ role: Role }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.role));
  }

  /** PUT /api/roles/:id — reemplazo completo. */
  replace(id: number, payload: RolePayload): Observable<Role> {
    return this.http
      .put<{ role: Role }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.role));
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
