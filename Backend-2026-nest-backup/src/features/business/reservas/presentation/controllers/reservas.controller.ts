import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '@/features/auth/infrastructure/guards/permission.guard';
import { ReservasService } from '../../application/use-cases/reservas.service';
import { CreateReservaDto } from '../dto/create-reserva.dto';
import { UpdateReservaDto } from '../dto/update-reserva.dto';

@ApiTags('Reservas')
@ApiBearerAuth()
@Controller('reservas')
export class ReservasController {
  constructor(private readonly service: ReservasService) {}

  @Get()
  @ApiQuery({ name: 'libro_id', required: false })
  @ApiQuery({ name: 'lector_id', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: ['PENDIENTE', 'ATENDIDA', 'CANCELADA'] })
  @ApiOperation({ summary: 'Listar reservas con su lector y libro (RBAC)' })
  @UseGuards(PermissionGuard)
  getAll(
    @Query('libro_id') libroId?: string,
    @Query('lector_id') lectorId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.getAll({
      libroId: libroId ? Number(libroId) : undefined,
      lectorId: lectorId ? Number(lectorId) : undefined,
      estado,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reserva por ID (RBAC)' })
  @UseGuards(PermissionGuard)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Reservar un libro (RBAC)' })
  @UseGuards(PermissionGuard)
  create(@Body() dto: CreateReservaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cambiar fecha de fin u observaciones de una reserva pendiente (RBAC)' })
  @UseGuards(PermissionGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReservaDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/atender')
  @ApiOperation({ summary: 'Marcar como atendida: PENDIENTE → ATENDIDA (RBAC)' })
  @UseGuards(PermissionGuard)
  atender(@Param('id', ParseIntPipe) id: number) {
    return this.service.atender(id);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar: PENDIENTE → CANCELADA (RBAC)' })
  @UseGuards(PermissionGuard)
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancelar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar reserva atendida o cancelada (RBAC)' })
  @UseGuards(PermissionGuard)
  deletePhysical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePhysical(id);
  }
}
