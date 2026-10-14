import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
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
  @ApiOperation({ summary: '[NIVEL 1] Publico: Sin autenticacion' })
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
  @ApiHeader({ name: 'x-api-key', required: true, description: 'lectura-abierta-basic-key' })
  @ApiOperation({ summary: '[NIVEL 2] Solo autenticacion (x-api-key)' })
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
  @ApiOperation({ summary: '[NIVEL 3] Autenticacion con JWT Bearer' })
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
  @ApiOperation({ summary: '[NIVEL 4] JWT + RBAC: Solo rol ADMIN puede crear lectores' })
  async crearLector(@Body() body: any) {
    const lector = await LectorModel.create(body);
    return {
      nivel: 'Nivel 4 - JWT + RBAC (ADMIN)',
      data: lector,
    };
  }
}
