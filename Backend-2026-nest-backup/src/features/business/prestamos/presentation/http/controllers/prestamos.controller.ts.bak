import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../auth/infrastructure/guards/jwt-auth.guard';
import { BasicAuthGuard } from '../../../../../auth/infrastructure/guards/basic-auth.guard';
import { RolesGuard, Roles } from '../../../../../auth/infrastructure/guards/roles.guard';
import { UserRole } from '../../../../../auth/infrastructure/persistence/models/user.model';
import { PrestamoModel } from '../../../infrastructure/persistence/models/prestamo.model';

@ApiTags('Business - Prestamos')
@Controller('prestamos')
export class PrestamosController {
  // NIVEL 1: Sin autenticacion
  @Get('estadisticas-publicas')
  @ApiOperation({ summary: '[NIVEL 1] Público: consulta sin credenciales' })
  @ApiOkResponse({ description: 'Métricas públicas de préstamos (HTTP 200)' })
  async stats() {
    const total = await PrestamoModel.count();
    return {
      nivel: 'Nivel 1 - Sin autenticacion',
      totalPrestamosRegistrados: total,
    };
  }

  // NIVEL 2: Solo autenticacion (x-api-key)
  @Get('resumen-interno')
  @UseGuards(BasicAuthGuard)
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Credencial de servicio (por defecto: lectura-abierta-basic-key)',
  })
  @ApiOperation({ summary: '[NIVEL 2] Solo autenticación básica (x-api-key)' })
  @ApiOkResponse({ description: 'Resumen interno con credencial válida (HTTP 200)' })
  @ApiUnauthorizedResponse({ description: 'Falta o es inválida la cabecera x-api-key (HTTP 401)' })
  async resumenInterno() {
    return {
      nivel: 'Nivel 2 - Solo autenticacion',
      prestamos: await PrestamoModel.findAll({ limit: 5 }),
    };
  }

  // NIVEL 3: Autenticacion + JWT Token + Refresh
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[NIVEL 3] Autenticación JWT Token + Refresh' })
  @ApiOkResponse({ description: 'Listado completo con token válido (HTTP 200)' })
  @ApiUnauthorizedResponse({ description: 'Token Bearer ausente, inválido o expirado (HTTP 401)' })
  async listarPrestamos() {
    return {
      nivel: 'Nivel 3 - Autenticacion JWT Token',
      data: await PrestamoModel.findAll(),
    };
  }

  // NIVEL 4: JWT + RBAC (Solo ADMIN o BIBLIOTECARIO)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BIBLIOTECARIO)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[NIVEL 4] JWT + RBAC: solo ADMIN o BIBLIOTECARIO' })
  @ApiCreatedResponse({ description: 'Préstamo creado con rol autorizado (HTTP 201)' })
  @ApiUnauthorizedResponse({ description: 'Token Bearer ausente, inválido o expirado (HTTP 401)' })
  @ApiForbiddenResponse({ description: 'El rol del usuario no está autorizado (HTTP 403)' })
  async crearPrestamo(@Body() body: any) {
    const prestamo = await PrestamoModel.create(body);
    return {
      nivel: 'Nivel 4 - JWT + RBAC Autorizado',
      data: prestamo,
    };
  }
}
