import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Op, QueryTypes } from 'sequelize';
import { AuthService } from '../auth/application/use-cases/auth.service';
import { ResourceModel } from '../auth/infrastructure/persistence/models/resource.model';
import { RoleResourceModel } from '../auth/infrastructure/persistence/models/role-resource.model';
import { RoleModel } from '../auth/infrastructure/persistence/models/role.model';
import { UserModel, UserRole } from '../auth/infrastructure/persistence/models/user.model';
import { BcryptPasswordHasherService } from '../../infrastructure/security/hashing/bcrypt-password-hasher.service';
import {
  ConcesionDto,
  CreateRecursoDto,
  CreateUsuarioDto,
  RoleDto,
  UpdateRecursoDto,
  UpdateUsuarioDto,
} from './admin.dto';

/** Columnas públicas: nunca se exponen password_hash ni refresh_token_hash. */
const USUARIO_PUBLICO = ['id', 'username', 'nombre', 'email', 'rol', 'is_active', 'createdAt', 'updatedAt'];

/**
 * Administración del RBAC sobre el modelo de lecturaabierta:
 * usuarios.rol (un rol por usuario) · roles · recursos · roles_recursos.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly hasher: BcryptPasswordHasherService,
    private readonly auth: AuthService,
  ) {}

  private get db() {
    return ResourceModel.sequelize!;
  }

  // ═══════════════════════════ Usuarios ═══════════════════════════

  listarUsuarios() {
    return UserModel.findAll({ attributes: USUARIO_PUBLICO, order: [['id', 'ASC']] });
  }

  async obtenerUsuario(id: number) {
    const user = await UserModel.findByPk(id, { attributes: USUARIO_PUBLICO });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return user;
  }

  /** GET /usuarios/:id/permisos — la misma consulta que usa /api/permisos. */
  async permisosUsuario(id: number) {
    const user = await this.obtenerUsuario(id);
    return this.auth.permisosEfectivos(user.rol);
  }

  async crearUsuario(dto: CreateUsuarioDto) {
    await this.exigirRol(dto.rol);
    await this.exigirUnico(dto.username, dto.email);

    const user = await UserModel.create({
      username: dto.username.trim(),
      nombre: dto.nombre?.trim() || null,
      email: dto.email.trim().toLowerCase(),
      password_hash: await this.hasher.hash(dto.password),
      rol: dto.rol as UserRole,
      is_active: true,
    });
    return this.obtenerUsuario(user.id);
  }

  async actualizarUsuario(id: number, dto: UpdateUsuarioDto, actorId?: number) {
    const user = await UserModel.findByPk(id);
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    if (dto.rol && dto.rol !== user.rol) {
      if (id === actorId) throw new ForbiddenException('No puedes cambiar tu propio rol');
      await this.exigirRol(dto.rol);
    }
    await this.exigirUnico(dto.username, dto.email, id);

    await user.update({
      ...(dto.username !== undefined ? { username: dto.username.trim() } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() || null } : {}),
      ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
      ...(dto.rol !== undefined ? { rol: dto.rol as UserRole } : {}),
    });
    return this.obtenerUsuario(id);
  }

  /** Baja lógica: además revoca el refresh, así no puede renovar su sesión. */
  async desactivarUsuario(id: number, actorId?: number) {
    if (id === actorId) throw new ForbiddenException('No puedes desactivar tu propio usuario');
    const user = await UserModel.findByPk(id);
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    await user.update({ is_active: false, refresh_token_hash: null as unknown as string });
    return this.obtenerUsuario(id);
  }

  async activarUsuario(id: number) {
    const user = await UserModel.findByPk(id);
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    await user.update({ is_active: true });
    return this.obtenerUsuario(id);
  }

  async eliminarUsuario(id: number, actorId?: number) {
    if (id === actorId) throw new ForbiddenException('No puedes eliminar tu propio usuario');
    const user = await UserModel.findByPk(id);
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    await user.destroy();
    return { message: 'Usuario eliminado permanentemente', id };
  }

  private async exigirRol(name: string) {
    const rol = await RoleModel.findOne({ where: { name } });
    if (!rol) throw new BadRequestException(`El rol ${name} no existe`);
  }

  private async exigirUnico(username?: string, email?: string, exceptId?: number) {
    const condiciones = [
      ...(username ? [{ username: username.trim() }] : []),
      ...(email ? [{ email: email.trim().toLowerCase() }] : []),
    ];
    if (condiciones.length === 0) return;
    const existente = await UserModel.findOne({
      where: {
        [Op.or]: condiciones,
        ...(exceptId ? { id: { [Op.ne]: exceptId } } : {}),
      },
    });
    if (existente) throw new ConflictException('El username o el email ya están registrados');
  }

  // ═══════════════════════════ Roles ═══════════════════════════

  /** Cada rol con cuántos usuarios lo tienen y cuántos permisos se le concedieron. */
  listarRoles() {
    return this.db.query(
      `SELECT r.id, r.name,
              (SELECT COUNT(*) FROM usuarios u WHERE u.rol = r.name) AS usuarios,
              (SELECT COUNT(*) FROM roles_recursos rr WHERE rr.role_id = r.id) AS permisos
         FROM roles r
        ORDER BY r.id`,
      { type: QueryTypes.SELECT },
    );
  }

  async crearRol(dto: RoleDto) {
    if (await RoleModel.findOne({ where: { name: dto.name } })) {
      throw new ConflictException(`El rol ${dto.name} ya existe`);
    }
    return RoleModel.create({ name: dto.name });
  }

  async actualizarRol(id: number, dto: RoleDto) {
    const rol = await this.exigirRolPorId(id);
    if (dto.name === rol.name) return rol;

    if ((await this.usuariosConRol(rol.name)) > 0) {
      throw new ConflictException('No se puede renombrar un rol que tiene usuarios asignados');
    }
    if (await RoleModel.findOne({ where: { name: dto.name } })) {
      throw new ConflictException(`El rol ${dto.name} ya existe`);
    }
    await rol.update({ name: dto.name });
    return rol;
  }

  async eliminarRol(id: number) {
    const rol = await this.exigirRolPorId(id);
    if (rol.name === UserRole.ADMIN) {
      throw new ForbiddenException('El rol ADMIN no se puede eliminar');
    }
    if ((await this.usuariosConRol(rol.name)) > 0) {
      throw new ConflictException('No se puede eliminar un rol que tiene usuarios asignados');
    }
    await RoleResourceModel.destroy({ where: { role_id: id } });
    await rol.destroy();
    return { message: 'Rol eliminado junto con sus concesiones', id };
  }

  private async exigirRolPorId(id: number) {
    const rol = await RoleModel.findByPk(id);
    if (!rol) throw new NotFoundException(`Rol con id ${id} no encontrado`);
    return rol;
  }

  private usuariosConRol(name: string) {
    return UserModel.count({ where: { rol: name } });
  }

  // ═══════════════════════════ Recursos ═══════════════════════════

  listarRecursos() {
    return ResourceModel.findAll({ order: [['path', 'ASC'], ['method', 'ASC']] });
  }

  async crearRecurso(dto: CreateRecursoDto) {
    const path = normalizarPath(dto.path);
    await this.exigirRecursoUnico(dto.method, path);
    return ResourceModel.create({ method: dto.method, path, description: dto.description ?? null });
  }

  async actualizarRecurso(id: number, dto: UpdateRecursoDto) {
    const recurso = await ResourceModel.findByPk(id);
    if (!recurso) throw new NotFoundException(`Recurso con id ${id} no encontrado`);

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

  async eliminarRecurso(id: number) {
    const recurso = await ResourceModel.findByPk(id);
    if (!recurso) throw new NotFoundException(`Recurso con id ${id} no encontrado`);
    await RoleResourceModel.destroy({ where: { resource_id: id } });
    await recurso.destroy();
    return { message: 'Recurso eliminado junto con sus concesiones', id };
  }

  private async exigirRecursoUnico(method: string, path: string, exceptId?: number) {
    const existente = await ResourceModel.findOne({
      where: { method, path, ...(exceptId ? { id: { [Op.ne]: exceptId } } : {}) },
    });
    if (existente) throw new ConflictException(`Ya existe el recurso ${method} ${path}`);
  }

  // ═══════════════════════════ Concesiones ═══════════════════════════

  listarConcesiones(roleId?: number) {
    return this.db.query(
      `SELECT rr.role_id, r.name AS role_name,
              rr.resource_id, rec.method, rec.path, rec.description
         FROM roles_recursos rr
         JOIN roles r ON r.id = rr.role_id
         JOIN recursos rec ON rec.id = rr.resource_id
        ${roleId ? 'WHERE rr.role_id = :roleId' : ''}
        ORDER BY r.name, rec.path, rec.method`,
      { replacements: { roleId }, type: QueryTypes.SELECT },
    );
  }

  async conceder(dto: ConcesionDto) {
    await this.exigirRolPorId(dto.role_id);
    if (!(await ResourceModel.findByPk(dto.resource_id))) {
      throw new NotFoundException(`Recurso con id ${dto.resource_id} no encontrado`);
    }
    const existente = await RoleResourceModel.findOne({
      where: { role_id: dto.role_id, resource_id: dto.resource_id },
    });
    if (existente) throw new ConflictException('El rol ya tiene ese permiso');

    await RoleResourceModel.create({ role_id: dto.role_id, resource_id: dto.resource_id });
    const [concesion] = await this.listarConcesionPar(dto.role_id, dto.resource_id);
    return concesion;
  }

  /** Revocar = borrar la fila. ADMIN nunca pierde la administración de concesiones. */
  async revocar(roleId: number, resourceId: number) {
    const rol = await this.exigirRolPorId(roleId);
    const recurso = await ResourceModel.findByPk(resourceId);
    if (rol.name === UserRole.ADMIN && recurso?.path.startsWith('/api/concesiones-rol')) {
      throw new ForbiddenException(
        'No se puede quitar a ADMIN la administración de concesiones: nadie podría volver a concederlas',
      );
    }
    const borradas = await RoleResourceModel.destroy({
      where: { role_id: roleId, resource_id: resourceId },
    });
    if (borradas === 0) throw new NotFoundException('Ese rol no tenía ese permiso');
    return { message: 'Permiso revocado', role_id: roleId, resource_id: resourceId };
  }

  private listarConcesionPar(roleId: number, resourceId: number) {
    return this.db.query(
      `SELECT rr.role_id, r.name AS role_name,
              rr.resource_id, rec.method, rec.path, rec.description
         FROM roles_recursos rr
         JOIN roles r ON r.id = rr.role_id
         JOIN recursos rec ON rec.id = rr.resource_id
        WHERE rr.role_id = :roleId AND rr.resource_id = :resourceId`,
      { replacements: { roleId, resourceId }, type: QueryTypes.SELECT },
    );
  }
}

/** "/api//libros/" → "/api/libros"; la raíz "/" se conserva. */
function normalizarPath(path: string): string {
  const limpio = path.trim().replace(/\/{2,}/g, '/');
  return limpio.length > 1 ? limpio.replace(/\/$/, '') : limpio;
}
