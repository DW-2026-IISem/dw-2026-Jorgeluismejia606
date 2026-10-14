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
import { LectorModel } from '../../../infrastructure/persistence/models/lector.model';

@ApiTags('Business - Lectores')
@Controller('lectores')
export class LectoresController {
  // NIVEL 1: Sin autenticacion
  @Get('publico')
  @ApiOperation({ summary: '[NIVEL 1] Público: sin autenticación' })
  @ApiOkResponse({ description: 'Listado público de lectores (HTTP 200)' })
  async obtenerPublico() {
    return {
      nivel: 'Nivel 1 - Sin autenticacion',
      mensaje: 'Acceso publico permitido a lectores activos',
      data: await LectorModel.findAll({ limit: 5 }),
    };
  }

  // NIVEL 2: Solo autenticacion (x-api-key)
  @Get('autenticado-basico')
  @UseGuards(BasicAuthGuard)
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Credencial de servicio (por defecto: lectura-abierta-basic-key)',
  })
  @ApiOperation({ summary: '[NIVEL 2] Solo autenticación (x-api-key)' })
  @ApiOkResponse({ description: 'Acceso concedido con credencial de servicio (HTTP 200)' })
  @ApiUnauthorizedResponse({ description: 'Falta o es inválida la cabecera x-api-key (HTTP 401)' })
  async obtenerSoloAuth() {
    return {
      nivel: 'Nivel 2 - Solo autenticacion',
      mensaje: 'Acceso permitido con credencial valida',
      data: await LectorModel.findAll({ limit: 10 }),
    };
  }

  // NIVEL 3: Autenticacion + JWT Token + Refresh
  @Get('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[NIVEL 3] Autenticación con JWT Bearer' })
  @ApiOkResponse({ description: 'Listado completo con token válido (HTTP 200)' })
  @ApiUnauthorizedResponse({ description: 'Token Bearer ausente, inválido o expirado (HTTP 401)' })
  async obtenerConJwt() {
    return {
      nivel: 'Nivel 3 - JWT Bearer validado',
      data: await LectorModel.findAll(),
    };
  }

  // NIVEL 4: JWT + RBAC (Solo ADMIN)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[NIVEL 4] JWT + RBAC: solo el rol ADMIN puede crear lectores' })
  @ApiCreatedResponse({ description: 'Lector creado con token de rol ADMIN (HTTP 201)' })
  @ApiUnauthorizedResponse({ description: 'Token Bearer ausente, inválido o expirado (HTTP 401)' })
  @ApiForbiddenResponse({ description: 'El rol del usuario no es ADMIN (HTTP 403)' })
  async crearLector(@Body() body: any) {
    const lector = await LectorModel.create(body);
    return {
      nivel: 'Nivel 4 - JWT + RBAC (ADMIN)',
      data: lector,
    };
  }
}
