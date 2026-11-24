"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcesionesController = exports.RecursosController = exports.RolesController = exports.UsuariosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permission_guard_1 = require("../auth/infrastructure/guards/permission.guard");
const admin_dto_1 = require("./admin.dto");
const admin_service_1 = require("./admin.service");
let UsuariosController = class UsuariosController {
    constructor(admin) {
        this.admin = admin;
    }
    listar() {
        return this.admin.listarUsuarios();
    }
    obtener(id) {
        return this.admin.obtenerUsuario(id);
    }
    permisos(id) {
        return this.admin.permisosUsuario(id);
    }
    crear(dto) {
        return this.admin.crearUsuario(dto);
    }
    actualizar(id, dto, req) {
        return this.admin.actualizarUsuario(id, dto, req.user?.sub);
    }
    desactivar(id, req) {
        return this.admin.desactivarUsuario(id, req.user?.sub);
    }
    activar(id) {
        return this.admin.activarUsuario(id);
    }
    eliminar(id, req) {
        return this.admin.eliminarUsuario(id, req.user?.sub);
    }
};
exports.UsuariosController = UsuariosController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar usuarios (sin hashes) (RBAC)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Ver usuario (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "obtener", null);
__decorate([
    (0, common_1.Get)(':id/permisos'),
    (0, swagger_1.ApiOperation)({ summary: 'Permisos efectivos de un usuario (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "permisos", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear usuario: única vez que viaja la contraseña (RBAC)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateUsuarioDto]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "crear", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Editar usuario o cambiar su rol (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, admin_dto_1.UpdateUsuarioDto, Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Desactivar usuario y revocar su refresh (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "desactivar", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivar usuario (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "activar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar usuario (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "eliminar", null);
exports.UsuariosController = UsuariosController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Usuarios'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('usuarios'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], UsuariosController);
let RolesController = class RolesController {
    constructor(admin) {
        this.admin = admin;
    }
    listar() {
        return this.admin.listarRoles();
    }
    crear(dto) {
        return this.admin.crearRol(dto);
    }
    actualizar(id, dto) {
        return this.admin.actualizarRol(id, dto);
    }
    eliminar(id) {
        return this.admin.eliminarRol(id);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar roles con conteo de usuarios y permisos (RBAC)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear rol (nombre en MAYÚSCULAS) (RBAC)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.RoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "crear", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Renombrar rol sin usuarios (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, admin_dto_1.RoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar rol sin usuarios y sus concesiones (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "eliminar", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], RolesController);
let RecursosController = class RecursosController {
    constructor(admin) {
        this.admin = admin;
    }
    listar() {
        return this.admin.listarRecursos();
    }
    crear(dto) {
        return this.admin.crearRecurso(dto);
    }
    actualizar(id, dto) {
        return this.admin.actualizarRecurso(id, dto);
    }
    eliminar(id) {
        return this.admin.eliminarRecurso(id);
    }
};
exports.RecursosController = RecursosController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Catálogo de recursos (método + ruta) (RBAC)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear recurso (RBAC)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateRecursoDto]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "crear", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Editar recurso (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, admin_dto_1.UpdateRecursoDto]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar recurso y sus concesiones (RBAC)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RecursosController.prototype, "eliminar", null);
exports.RecursosController = RecursosController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Recursos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('recursos'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], RecursosController);
let ConcesionesController = class ConcesionesController {
    constructor(admin) {
        this.admin = admin;
    }
    listar(roleId) {
        return this.admin.listarConcesiones(roleId ? Number(roleId) : undefined);
    }
    conceder(dto) {
        return this.admin.conceder(dto);
    }
    revocar(roleId, resourceId) {
        return this.admin.revocar(roleId, resourceId);
    }
};
exports.ConcesionesController = ConcesionesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'role_id', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Listar concesiones rol ↔ recurso (RBAC)' }),
    __param(0, (0, common_1.Query)('role_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConcesionesController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Conceder un recurso a un rol (RBAC)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.ConcesionDto]),
    __metadata("design:returntype", void 0)
], ConcesionesController.prototype, "conceder", null);
__decorate([
    (0, common_1.Delete)(':role_id/:resource_id'),
    (0, swagger_1.ApiOperation)({ summary: 'Revocar un recurso de un rol (RBAC)' }),
    __param(0, (0, common_1.Param)('role_id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('resource_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ConcesionesController.prototype, "revocar", null);
exports.ConcesionesController = ConcesionesController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Concesiones'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.Controller)('concesiones-rol'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], ConcesionesController);
//# sourceMappingURL=admin.controllers.js.map