import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DetallePrestamo } from '../detalle-prestamos/detalle-prestamo.model';
import { Prestamo, PrestamoCreatePayload, PrestamoUpdatePayload } from './prestamo.model';

/** /api/prestamos — POST es transaccional (cabecera + detalle + stock). */
@Injectable({ providedIn: 'root' })
export class PrestamoApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/prestamos`;

  list(): Observable<Prestamo[]> {
    return this.http.get<{ prestamos: Prestamo[] }>(this.base).pipe(map((r) => r.prestamos));
  }

  get(id: number): Observable<Prestamo> {
    return this.http.get<{ prestamo: Prestamo }>(`${this.base}/${id}`).pipe(map((r) => r.prestamo));
  }

  /** POST transaccional: devuelve `{ prestamo, items }`; el stock ya está descontado. */
  create(payload: PrestamoCreatePayload): Observable<Prestamo> {
    return this.http
      .post<{ prestamo: Prestamo; items: DetallePrestamo[] }>(this.base, payload)
      .pipe(map((r) => ({ ...r.prestamo, items: r.items })));
  }

  /** PATCH de la cabecera (impuesto, descuentos, lector, fecha). */
  update(id: number, payload: PrestamoUpdatePayload): Observable<Prestamo> {
    return this.http
      .patch<{ prestamo: Prestamo }>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.prestamo));
  }

  /** Cancelación: préstamo y líneas pasan a inactive y el backend restaura el stock. */
  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  /** DELETE físico: restaura stock, borra las líneas y luego la cabecera. */
  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
