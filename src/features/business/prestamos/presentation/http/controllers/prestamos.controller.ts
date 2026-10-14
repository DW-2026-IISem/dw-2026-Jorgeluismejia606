import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
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
  @ApiOperation({ summary: '[NIVEL 1] Publico: Consulta sin credenciales' })
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
  @ApiHeader({ name: 'x-api-key', required: true, description: 'lectura-abierta-basic-key' })
  @ApiOperation({ summary: '[NIVEL 2] Solo autenticacion basica' })
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
  @ApiOperation({ summary: '[NIVEL 3] Autenticacion JWT Token + Refresh' })
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
  @ApiOperation({ summary: '[NIVEL 4] JWT + RBAC: Solo roles permitidos' })
  async crearPrestamo(@Body() body: any) {
    const prestamo = await PrestamoModel.create(body);
    return {
      nivel: 'Nivel 4 - JWT + RBAC Autorizado',
      data: prestamo,
    };
  }
}
