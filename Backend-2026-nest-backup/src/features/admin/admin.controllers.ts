import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../auth/infrastructure/guards/permission.guard';
import {
  ConcesionDto,
  CreateRecursoDto,
  CreateUsuarioDto,
  RoleDto,
  UpdateRecursoDto,
  UpdateUsuarioDto,
} from './admin.dto';
import { AdminService } from './admin.service';

type AuthRequest = { user?: { sub: number } };

@ApiTags('Admin - Usuarios')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (sin hashes) (RBAC)' })
  listar() {
    return this.admin.listarUsuarios();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver usuario (RBAC)' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.admin.obtenerUsuario(id);
  }

  @Get(':id/permisos')
  @ApiOperation({ summary: 'Permisos efectivos de un usuario (RBAC)' })
  permisos(@Param('id', ParseIntPipe) id: number) {
    return this.admin.permisosUsuario(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario: única vez que viaja la contraseña (RBAC)' })
  crear(@Body() dto: CreateUsuarioDto) {
    return this.admin.crearUsuario(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar usuario o cambiar su rol (RBAC)' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto, @Req() req: AuthRequest) {
    return this.admin.actualizarUsuario(id, dto, req.user?.sub);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar usuario y revocar su refresh (RBAC)' })
  desactivar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.admin.desactivarUsuario(id, req.user?.sub);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reactivar usuario (RBAC)' })
  activar(@Param('id', ParseIntPipe) id: number) {
    return this.admin.activarUsuario(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario (RBAC)' })
  eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.admin.eliminarUsuario(id, req.user?.sub);
  }
}

@ApiTags('Admin - Roles')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Listar roles con conteo de usuarios y permisos (RBAC)' })
  listar() {
    return this.admin.listarRoles();
  }

  @Post()
  @ApiOperation({ summary: 'Crear rol (nombre en MAYÚSCULAS) (RBAC)' })
  crear(@Body() dto: RoleDto) {
    return this.admin.crearRol(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Renombrar rol sin usuarios (RBAC)' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: RoleDto) {
    return this.admin.actualizarRol(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar rol sin usuarios y sus concesiones (RBAC)' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.admin.eliminarRol(id);
  }
}

@ApiTags('Admin - Recursos')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('recursos')
export class RecursosController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Catálogo de recursos (método + ruta) (RBAC)' })
  listar() {
    return this.admin.listarRecursos();
  }

  @Post()
  @ApiOperation({ summary: 'Crear recurso (RBAC)' })
  crear(@Body() dto: CreateRecursoDto) {
    return this.admin.crearRecurso(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar recurso (RBAC)' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecursoDto) {
    return this.admin.actualizarRecurso(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar recurso y sus concesiones (RBAC)' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.admin.eliminarRecurso(id);
  }
}

@ApiTags('Admin - Concesiones')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('concesiones-rol')
export class ConcesionesController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  @ApiQuery({ name: 'role_id', required: false })
  @ApiOperation({ summary: 'Listar concesiones rol ↔ recurso (RBAC)' })
  listar(@Query('role_id') roleId?: string) {
    return this.admin.listarConcesiones(roleId ? Number(roleId) : undefined);
  }

  @Post()
  @ApiOperation({ summary: 'Conceder un recurso a un rol (RBAC)' })
  conceder(@Body() dto: ConcesionDto) {
    return this.admin.conceder(dto);
  }

  @Delete(':role_id/:resource_id')
  @ApiOperation({ summary: 'Revocar un recurso de un rol (RBAC)' })
  revocar(
    @Param('role_id', ParseIntPipe) roleId: number,
    @Param('resource_id', ParseIntPipe) resourceId: number,
  ) {
    return this.admin.revocar(roleId, resourceId);
  }
}
