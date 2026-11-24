import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification';
import { toApiMessage } from '../utils/api-error';

/**
 * Traduce fallos transversales a un toast: backend caído (0), sin permiso (403)
 * y errores del servidor (5xx). Los 400/404/409 los muestra cada pantalla, y el
 * 401 lo resuelve `authInterceptor`. El error se re-lanza siempre.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          notify.error('Sin conexión', toApiMessage(error));
        } else if (error.status === 403) {
          notify.warn('Acceso denegado', `${req.method} ${new URL(req.url, 'http://x').pathname}`);
        } else if (error.status >= 500) {
          notify.error('Error del servidor', toApiMessage(error));
        }
      }
      return throwError(() => error);
    }),
  );
};
