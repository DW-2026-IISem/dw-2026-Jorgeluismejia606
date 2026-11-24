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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("sequelize");
const auth_service_1 = require("../auth/application/use-cases/auth.service");
const resource_model_1 = require("../auth/infrastructure/persistence/models/resource.model");
const role_resource_model_1 = require("../auth/infrastructure/persistence/models/role-resource.model");
const role_model_1 = require("../auth/infrastructure/persistence/models/role.model");
const user_model_1 = require("../auth/infrastructure/persistence/models/user.model");
const bcrypt_password_hasher_service_1 = require("../../infrastructure/security/hashing/bcrypt-password-hasher.service");
const USUARIO_PUBLICO = ['id', 'username', 'nombre', 'email', 'rol', 'is_active', 'createdAt', 'updatedAt'];
let AdminService = class AdminService {
    constructor(hasher, auth) {
        this.hasher = hasher;
        this.auth = auth;
    }
    get db() {
        return resource_model_1.ResourceModel.sequelize;
    }
    listarUsuarios() {
        return user_model_1.UserModel.findAll({ attributes: USUARIO_PUBLICO, order: [['id', 'ASC']] });
    }
    async obtenerUsuario(id) {
        const user = await user_model_1.UserModel.findByPk(id, { attributes: USUARIO_PUBLICO });
        if (!user)
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        return user;
    }
    async permisosUsuario(id) {
        const user = await this.obtenerUsuario(id);
        return this.auth.permisosEfectivos(user.rol);
    }
    async crearUsuario(dto) {
        await this.exigirRol(dto.rol);
        await this.exigirUnico(dto.username, dto.email);
        const user = await user_model_1.UserModel.create({
            username: dto.username.trim(),
            nombre: dto.nombre?.trim() || null,
            email: dto.email.trim().toLowerCase(),
            password_hash: await this.hasher.hash(dto.password),
            rol: dto.rol,
            is_active: true,
        });
        return this.obtenerUsuario(user.id);
    }
    async actualizarUsuario(id, dto, actorId) {
        const user = await user_model_1.UserModel.findByPk(id);
        if (!user)
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        if (dto.rol && dto.rol !== user.rol) {
            if (id === actorId)
                throw new common_1.ForbiddenException('No puedes cambiar tu propio rol');
            await this.exigirRol(dto.rol);
        }
        await this.exigirUnico(dto.username, dto.email, id);
        await user.update({
            ...(dto.username !== undefined ? { username: dto.username.trim() } : {}),
            ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() || null } : {}),
            ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
            ...(dto.rol !== undefined ? { rol: dto.rol } : {}),
        });
        return this.obtenerUsuario(id);
    }
    async desactivarUsuario(id, actorId) {
        if (id === actorId)
            throw new common_1.ForbiddenException('No puedes desactivar tu propio usuario');
        const user = await user_model_1.UserModel.findByPk(id);
        if (!user)
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        await user.update({ is_active: false, refresh_token_hash: null });
        return this.obtenerUsuario(id);
    }
    async activarUsuario(id) {
        const user = await user_model_1.UserModel.findByPk(id);
        if (!user)
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        await user.update({ is_active: true });
        return this.obtenerUsuario(id);
    }
    async eliminarUsuario(id, actorId) {
        if (id === actorId)
            throw new common_1.ForbiddenException('No puedes eliminar tu propio usuario');
        const user = await user_model_1.UserModel.findByPk(id);
        if (!user)
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        await user.destroy();
        return { message: 'Usuario eliminado permanentemente', id };
    }
    async exigirRol(name) {
        const rol = await role_model_1.RoleModel.findOne({ where: { name } });
        if (!rol)
            throw new common_1.BadRequestException(`El rol ${name} no existe`);
    }
    async exigirUnico(username, email, exceptId) {
        const condiciones = [
            ...(username ? [{ username: username.trim() }] : []),
            ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ];
        if (condiciones.length === 0)
            return;
        const existente = await user_model_1.UserModel.findOne({
            where: {
                [sequelize_1.Op.or]: condiciones,
                ...(exceptId ? { id: { [sequelize_1.Op.ne]: exceptId } } : {}),
            },
        });
        if (existente)
            throw new common_1.ConflictException('El username o el email ya están registrados');
    }
    listarRoles() {
        return this.db.query(`SELECT r.id, r.name,
              (SELECT COUNT(*) FROM usuarios u WHERE u.rol = r.name) AS usuarios,
              (SELECT COUNT(*) FROM roles_recursos rr WHERE rr.role_id = r.id) AS permisos
         FROM roles r
        ORDER BY r.id`, { type: sequelize_1.QueryTypes.SELECT });
    }
    async crearRol(dto) {
        if (await role_model_1.RoleModel.findOne({ where: { name: dto.name } })) {
            throw new common_1.ConflictException(`El rol ${dto.name} ya existe`);
        }
        return role_model_1.RoleModel.create({ name: dto.name });
    }
    async actualizarRol(id, dto) {
        const rol = await this.exigirRolPorId(id);
        if (dto.name === rol.name)
            return rol;
        if ((await this.usuariosConRol(rol.name)) > 0) {
            throw new common_1.ConflictException('No se puede renombrar un rol que tiene usuarios asignados');
        }
        if (await role_model_1.RoleModel.findOne({ where: { name: dto.name } })) {
            throw new common_1.ConflictException(`El rol ${dto.name} ya existe`);
        }
        await rol.update({ name: dto.name });
        return rol;
    }
    async eliminarRol(id) {
        const rol = await this.exigirRolPorId(id);
        if (rol.name === user_model_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('El rol ADMIN no se puede eliminar');
        }
        if ((await this.usuariosConRol(rol.name)) > 0) {
            throw new common_1.ConflictException('No se puede eliminar un rol que tiene usuarios asignados');
        }
        await role_resource_model_1.RoleResourceModel.destroy({ where: { role_id: id } });
        await rol.destroy();
        return { message: 'Rol eliminado junto con sus concesiones', id };
    }
    async exigirRolPorId(id) {
        const rol = await role_model_1.RoleModel.findByPk(id);
        if (!rol)
            throw new common_1.NotFoundException(`Rol con id ${id} no encontrado`);
        return rol;
    }
    usuariosConRol(name) {
        return user_model_1.UserModel.count({ where: { rol: name } });
    }
    listarRecursos() {
        return resource_model_1.ResourceModel.findAll({ order: [['path', 'ASC'], ['method', 'ASC']] });
    }
    async crearRecurso(dto) {
        const path = normalizarPath(dto.path);
        await this.exigirRecursoUnico(dto.method, path);
        return resource_model_1.ResourceModel.create({ method: dto.method, path, description: dto.description ?? null });
    }
    async actualizarRecurso(id, dto) {
        const recurso = await resource_model_1.ResourceModel.findByPk(id);
        if (!recurso)
            throw new common_1.NotFoundException(`Recurso con id ${id} no encontrado`);
        const method = dto.method ?? recurso.method;
        const path = dto.path ? normalizarPath(dto.path) : recurso.path;
        await this.exigirRecursoUnico(method, path, id);
        await recurso.update({
            method,
            path,
            ...(dto.description !== undefined ? { description: dto.description } : {}),
        });
        return recurso;
    }
    async eliminarRecurso(id) {
        const recurso = await resource_model_1.ResourceModel.findByPk(id);
        if (!recurso)
            throw new common_1.NotFoundException(`Recurso con id ${id} no encontrado`);
        await role_resource_model_1.RoleResourceModel.destroy({ where: { resource_id: id } });
        await recurso.destroy();
        return { message: 'Recurso eliminado junto con sus concesiones', id };
    }
    async exigirRecursoUnico(method, path, exceptId) {
        const existente = await resource_model_1.ResourceModel.findOne({
            where: { method, path, ...(exceptId ? { id: { [sequelize_1.Op.ne]: exceptId } } : {}) },
        });
        if (existente)
            throw new common_1.ConflictException(`Ya existe el recurso ${method} ${path}`);
    }
    listarConcesiones(roleId) {
        return this.db.query(`SELECT rr.role_id, r.name AS role_name,
              rr.resource_id, rec.method, rec.path, rec.description
         FROM roles_recursos rr
         JOIN roles r ON r.id = rr.role_id
         JOIN recursos rec ON rec.id = rr.resource_id
        ${roleId ? 'WHERE rr.role_id = :roleId' : ''}
        ORDER BY r.name, rec.path, rec.method`, { replacements: { roleId }, type: sequelize_1.QueryTypes.SELECT });
    }
    async conceder(dto) {
        await this.exigirRolPorId(dto.role_id);
        if (!(await resource_model_1.ResourceModel.findByPk(dto.resource_id))) {
            throw new common_1.NotFoundException(`Recurso con id ${dto.resource_id} no encontrado`);
        }
        const existente = await role_resource_model_1.RoleResourceModel.findOne({
            where: { role_id: dto.role_id, resource_id: dto.resource_id },
        });
        if (existente)
            throw new common_1.ConflictException('El rol ya tiene ese permiso');
        await role_resource_model_1.RoleResourceModel.create({ role_id: dto.role_id, resource_id: dto.resource_id });
        const [concesion] = await this.listarConcesionPar(dto.role_id, dto.resource_id);
        return concesion;
    }
    async revocar(roleId, resourceId) {
        const rol = await this.exigirRolPorId(roleId);
        const recurso = await resource_model_1.ResourceModel.findByPk(resourceId);
        if (rol.name === user_model_1.UserRole.ADMIN && recurso?.path.startsWith('/api/concesiones-rol')) {
            throw new common_1.ForbiddenException('No se puede quitar a ADMIN la administración de concesiones: nadie podría volver a concederlas');
        }
        const borradas = await role_resource_model_1.RoleResourceModel.destroy({
            where: { role_id: roleId, resource_id: resourceId },
        });
        if (borradas === 0)
            throw new common_1.NotFoundException('Ese rol no tenía ese permiso');
        return { message: 'Permiso revocado', role_id: roleId, resource_id: resourceId };
    }
    listarConcesionPar(roleId, resourceId) {
        return this.db.query(`SELECT rr.role_id, r.name AS role_name,
              rr.resource_id, rec.method, rec.path, rec.description
         FROM roles_recursos rr
         JOIN roles r ON r.id = rr.role_id
         JOIN recursos rec ON rec.id = rr.resource_id
        WHERE rr.role_id = :roleId AND rr.resource_id = :resourceId`, { replacements: { roleId, resourceId }, type: sequelize_1.QueryTypes.SELECT });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bcrypt_password_hasher_service_1.BcryptPasswordHasherService, typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AdminService);
function normalizarPath(path) {
    const limpio = path.trim().replace(/\/{2,}/g, '/');
    return limpio.length > 1 ? limpio.replace(/\/$/, '') : limpio;
}
//# sourceMappingURL=admin.service.js.map