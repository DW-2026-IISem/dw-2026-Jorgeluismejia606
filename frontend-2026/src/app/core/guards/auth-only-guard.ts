import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../services/session-store';

/**
 * Pantallas que no existen en la Fase I (perfil y administración RBAC): con la
 * autenticación desactivada (modo laboratorio) redirige al dashboard.
 */
export const authOnlyGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);

  if (session.authEnabled) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
