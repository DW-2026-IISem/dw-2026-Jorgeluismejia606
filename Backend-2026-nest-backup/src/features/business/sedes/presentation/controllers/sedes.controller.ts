import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '@/features/auth/infrastructure/guards/permission.guard';
import { SedesService } from '../../application/use-cases/sedes.service';
import { CreateSedeDto } from '../dto/create-sede.dto';
import { UpdateSedeDto } from '../dto/update-sede.dto';

@ApiTags('Sedes')
@ApiBearerAuth()
@Controller('sedes')
export class SedesController {
  constructor(private readonly service: SedesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sedes activas (RBAC)' })
  @UseGuards(PermissionGuard)
  getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sede por ID (RBAC)' })
  @UseGuards(PermissionGuard)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear sede (RBAC)' })
  @UseGuards(PermissionGuard)
  create(@Body() dto: CreateSedeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualización total PUT (RBAC)' })
  @UseGuards(PermissionGuard)
  updatePut(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSedeDto) {
    return this.service.updatePut(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial PATCH (RBAC)' })
  @UseGuards(PermissionGuard)
  updatePatch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSedeDto) {
    return this.service.updatePatch(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminación física, solo sin ejemplares (RBAC)' })
  @UseGuards(PermissionGuard)
  deletePhysical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePhysical(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Eliminación lógica (RBAC)' })
  @UseGuards(PermissionGuard)
  deleteLogical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLogical(id);
  }
}
