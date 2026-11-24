import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '@/features/auth/infrastructure/guards/permission.guard';
import { AutoresService } from '../../application/use-cases/autores.service';
import { CreateAutorDto } from '../dto/create-autor.dto';
import { UpdateAutorDto } from '../dto/update-autor.dto';

@ApiTags('Autores')
@ApiBearerAuth()
@Controller('autores')
export class AutoresController {
  constructor(private readonly service: AutoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar autores activos (RBAC)' })
  @UseGuards(PermissionGuard)
  getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener autor por ID (RBAC)' })
  @UseGuards(PermissionGuard)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear autor (RBAC)' })
  @UseGuards(PermissionGuard)
  create(@Body() dto: CreateAutorDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualización total PUT (RBAC)' })
  @UseGuards(PermissionGuard)
  updatePut(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateAutorDto) {
    return this.service.updatePut(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualización parcial PATCH (RBAC)' })
  @UseGuards(PermissionGuard)
  updatePatch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAutorDto) {
    return this.service.updatePatch(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminación física y de sus relaciones con libros (RBAC)' })
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
