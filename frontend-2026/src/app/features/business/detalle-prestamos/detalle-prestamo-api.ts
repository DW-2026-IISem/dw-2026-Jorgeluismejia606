import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DetallePrestamo, DetallePrestamoPayload } from './detalle-prestamo.model';

/** /api/detalle-prestamos — agregar/editar líneas ajusta stock y totales. */
@Injectable({ providedIn: 'root' })
export class DetallePrestamoApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/detalle-prestamos`;

  list(): Observable<DetallePrestamo[]> {
    return this.http
      .get<{ detalle_prestamos: DetallePrestamo[] }>(this.base)
      .pipe(map((r) => r.detalle_prestamos));
  }

  get(id: number): Observable<DetallePrestamo> {
    return this.http
      .get<{ detalle_prestamo: DetallePrestamo }>(`${this.base}/${id}`)
      .pipe(map((r) => r.detalle_prestamo));
  }

  create(payload: DetallePrestamoPayload): Observable<DetallePrestamo> {
    return this.http
      .post<{ detalle_prestamo: DetallePrestamo }>(this.base, payload)
      .pipe(map((r) => r.detalle_prestamo));
  }

  /** PATCH solo acepta `cantidad`: el estado se cambia con `/deactivate`. */
  update(id: number, payload: { cantidad: number }): Observable<DetallePrestamo> {
    return this.http
      .patch<{ detalle_prestamo: DetallePrestamo }>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.detalle_prestamo));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
