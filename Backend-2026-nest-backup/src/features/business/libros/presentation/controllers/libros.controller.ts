import { PermissionGuard } from '@/features/auth/infrastructure/guards/permission.guard';
import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LibrosService } from '../../application/use-cases/libros.service';
import { CreateLibroDto } from '../dto/create-libro.dto';
import { UpdateLibroDto } from '../dto/update-libro.dto';

@ApiTags('Libros')
@Controller('libros')
export class LibrosController {
  constructor(private readonly service: LibrosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar libros activos con sus relaciones (RBAC)' })
  @UseGuards(PermissionGuard)
  getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener libro por ID con categoría y ejemplares (RBAC)' })
  @UseGuards(PermissionGuard)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear libro validando categoría activa (RBAC)' })
  @UseGuards(PermissionGuard)
  create(@Body() dto: CreateLibroDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualización total PUT de libro (RBAC)' })
  @UseGuards(PermissionGuard)
  updatePut(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateLibroDto) {
    return this.service.updatePut(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial PATCH de libro (RBAC)' })
  @UseGuards(PermissionGuard)
  updatePatch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLibroDto) {
    return this.service.updatePatch(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminación física de libro (RBAC)' })
  @UseGuards(PermissionGuard)
  deletePhysical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePhysical(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Eliminación lógica de libro (RBAC)' })
  @UseGuards(PermissionGuard)
  deleteLogical(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLogical(id);
  }
}
