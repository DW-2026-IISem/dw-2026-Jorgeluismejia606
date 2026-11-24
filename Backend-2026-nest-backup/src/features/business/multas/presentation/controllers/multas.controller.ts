import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '@/features/auth/infrastructure/guards/permission.guard';
import { MultasService } from '../../application/use-cases/multas.service';
import { CreateMultaDto } from '../dto/create-multa.dto';
import { UpdateMultaDto } from '../dto/update-multa.dto';

@ApiTags('Multas')
@ApiBearerAuth()
@Controller('multas')
export class MultasController {
  constructor(private readonly service: MultasService) {}

  @Get()
  @ApiQuery({ name: 'prestamo_id', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: ['PENDIENTE', 'PAGADA'] })
  @ApiOperation({ summary: 'Listar multas activas con su préstamo y lector (RBAC)' })
  @UseGuards(PermissionGuard)
  getAll(@Query('prestamo_id') prestamoId?: string, @Query('estado') estado?: string) {
    return this.service.getAll({ prestamoId: prestamoId ? Number(prestamoId) : undefined, estado });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener multa por ID (RBAC)' })
  @UseGuards(PermissionGuard)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear multa manual sobre un préstamo (RBAC)' })
  @UseGuards(PermissionGuard)
  create(@Body() dto: CreateMultaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Corregir multa pendiente (RBAC)' })
  @UseGuards(PermissionGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMultaDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/pagar')
  @ApiOperation({ summary: 'Registrar el pago: PENDIENTE → PAGADA (RBAC)' })
  @UseGuards(PermissionGuard)
  pagar(@Param('id', ParseIntPipe) id: number) {
    return this.service.pagar(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Anular multa pendiente (borrado lógico) (RBAC)' })
  @UseGuards(PermissionGuard)
  deleteLogical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLogical(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar multa pendiente (RBAC)' })
  @UseGuards(PermissionGuard)
  deletePhysical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePhysical(id);
  }
}
