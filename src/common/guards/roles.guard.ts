import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    // Lectura de rol vía cabecera o payload de token JWT
    const userRole = (request.headers['x-user-role'] || request.user?.role) as Rol;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `RN-10: Acceso denegado. Rol actual: [${userRole || 'ANÓNIMO'}]. Roles autorizados: [${requiredRoles.join(', ')}]`,
      );
    }
    return true;
  }
}
