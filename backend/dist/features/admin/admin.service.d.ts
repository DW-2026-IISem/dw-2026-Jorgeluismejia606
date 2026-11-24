import { AuthService } from '../auth/application/use-cases/auth.service';
import { ResourceModel } from '../auth/infrastructure/persistence/models/resource.model';
import { RoleModel } from '../auth/infrastructure/persistence/models/role.model';
import { UserModel } from '../auth/infrastructure/persistence/models/user.model';
import { BcryptPasswordHasherService } from '../../infrastructure/security/hashing/bcrypt-password-hasher.service';
import { ConcesionDto, CreateRecursoDto, CreateUsuarioDto, RoleDto, UpdateRecursoDto, UpdateUsuarioDto } from './admin.dto';
export declare class AdminService {
    private readonly hasher;
    private readonly auth;
    constructor(hasher: BcryptPasswordHasherService, auth: AuthService);
    private get db();
    listarUsuarios(): Promise<UserModel[]>;
    obtenerUsuario(id: number): Promise<UserModel>;
    permisosUsuario(id: number): Promise<any>;
    crearUsuario(dto: CreateUsuarioDto): Promise<UserModel>;
    actualizarUsuario(id: number, dto: UpdateUsuarioDto, actorId?: number): Promise<UserModel>;
    desactivarUsuario(id: number, actorId?: number): Promise<UserModel>;
    activarUsuario(id: number): Promise<UserModel>;
    eliminarUsuario(id: number, actorId?: number): Promise<{
        message: string;
        id: number;
    }>;
    private exigirRol;
    private exigirUnico;
    listarRoles(): Promise<object[]>;
    crearRol(dto: RoleDto): Promise<RoleModel>;
    actualizarRol(id: number, dto: RoleDto): Promise<RoleModel>;
    eliminarRol(id: number): Promise<{
        message: string;
        id: number;
    }>;
    private exigirRolPorId;
    private usuariosConRol;
    listarRecursos(): Promise<ResourceModel[]>;
    crearRecurso(dto: CreateRecursoDto): Promise<ResourceModel>;
    actualizarRecurso(id: number, dto: UpdateRecursoDto): Promise<ResourceModel>;
    eliminarRecurso(id: number): Promise<{
        message: string;
        id: number;
    }>;
    private exigirRecursoUnico;
    listarConcesiones(roleId?: number): Promise<object[]>;
    conceder(dto: ConcesionDto): Promise<object>;
    revocar(roleId: number, resourceId: number): Promise<{
        message: string;
        role_id: number;
        resource_id: number;
    }>;
    private listarConcesionPar;
}
