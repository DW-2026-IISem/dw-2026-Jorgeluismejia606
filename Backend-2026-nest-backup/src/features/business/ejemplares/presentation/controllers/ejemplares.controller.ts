import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '@/features/auth/infrastructure/guards/permission.guard';
import { EjemplaresService } from '../../application/use-cases/ejemplares.service';
import { CreateEjemplarDto } from '../dto/create-ejemplar.dto';
import { UpdateEjemplarDto } from '../dto/update-ejemplar.dto';

@ApiTags('Ejemplares')
@ApiBearerAuth()
@Controller('ejemplares')
export class EjemplaresController {
  constructor(private readonly service: EjemplaresService) {}

  @Get()
  @ApiQuery({ name: 'libro_id', required: false })
  @ApiOperation({ summary: 'Listar ejemplares activos con su libro y sede (RBAC)' })
  @UseGuards(PermissionGuard)
  getAll(@Query('libro_id') libroId?: string) {
    return this.service.getAll(libroId ? Number(libroId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ejemplar por ID (RBAC)' })
  @UseGuards(PermissionGuard)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear ejemplar (RBAC)' })
  @UseGuards(PermissionGuard)
  create(@Body() dto: CreateEjemplarDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualización total PUT (RBAC)' })
  @UseGuards(PermissionGuard)
  updatePut(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateEjemplarDto) {
    return this.service.updatePut(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial PATCH (RBAC)' })
  @UseGuards(PermissionGuard)
  updatePatch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEjemplarDto) {
    return this.service.updatePatch(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminación física, solo sin historial de préstamos (RBAC)' })
  @UseGuards(PermissionGuard)
  deletePhysical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePhysical(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Eliminación lógica, no si está prestado (RBAC)' })
  @UseGuards(PermissionGuard)
  deleteLogical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLogical(id);
  }
}
