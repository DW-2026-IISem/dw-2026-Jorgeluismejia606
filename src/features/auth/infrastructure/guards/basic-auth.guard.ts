import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // Simulación de autenticación básica de sistema
    if (!apiKey || apiKey !== 'lectura-abierta-basic-key') {
      throw new UnauthorizedException('Acceso no autorizado: Se requiere cabecera x-api-key válida');
    }

    return true;
  }
}
