import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryTypes } from 'sequelize';
import { ResourceModel } from '../persistence/models/resource.model';

/**
 * Rutas que NUNCA se abren en modo laboratorio: administrar el RBAC sin
 * sesión permitiría crear usuarios o concederse permisos sin identificarse.
 */
const SIEMPRE_PROTEGIDAS = ['/api/usuarios', '/api/roles', '/api/recursos', '/api/concesiones-rol'];

/**
 * authenticate + authorize (equivalente al de StoreLab).
 *
 * 1. AUTH_ENABLED=false → abre solo las rutas de NEGOCIO (Fase I, laboratorio).
 *    La administración del RBAC sigue exigiendo token y permiso.
 * 2. Sin Bearer válido → 401.
 * 3. Sin una fila en roles_recursos para (rol, MÉTODO, ruta) → 403.
 *
 * La ruta se compara con el PATRÓN registrado (req.route.path, p. ej.
 * '/api/libros/:id'), que es exactamente como se guarda en `recursos`.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly jwt = new JwtService({});

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method;
    const path: string = request.route?.path ?? request.path;

    const modoLaboratorio = (process.env.AUTH_ENABLED ?? 'true').toLowerCase() === 'false';
    const esAdministracion = SIEMPRE_PROTEGIDAS.some(
      (prefijo) => path === prefijo || path.startsWith(`${prefijo}/`),
    );
    if (modoLaboratorio && !esAdministracion) {
      return true;
    }

    // ── authenticate ──
    const header: string | undefined = request.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token Bearer no proporcionado');
    }
    let payload: { sub: number; rol: string };
    try {
      payload = await this.jwt.verifyAsync(header.slice(7), {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    request['user'] = payload;

    // ── authorize ──
    const [row] = await ResourceModel.sequelize!.query<{ n: number }>(
      `SELECT COUNT(*) AS n
         FROM roles r
         JOIN roles_recursos rr ON rr.role_id = r.id
         JOIN recursos rec ON rec.id = rr.resource_id
        WHERE r.name = :rol AND rec.method = :method AND rec.path = :path`,
      { replacements: { rol: payload.rol, method, path }, type: QueryTypes.SELECT },
    );

    if (!row || Number(row.n) === 0) {
      throw new ForbiddenException(`Permiso requerido: ${method} ${path}`);
    }
    return true;
  }
}
