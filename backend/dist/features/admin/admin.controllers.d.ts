import { ConcesionDto, CreateRecursoDto, CreateUsuarioDto, RoleDto, UpdateRecursoDto, UpdateUsuarioDto } from './admin.dto';
import { AdminService } from './admin.service';
type AuthRequest = {
    user?: {
        sub: number;
    };
};
export declare class UsuariosController {
    private readonly admin;
    constructor(admin: AdminService);
    listar(): Promise<import("../auth/infrastructure/persistence/models/user.model").UserModel[]>;
    obtener(id: number): Promise<import("../auth/infrastructure/persistence/models/user.model").UserModel>;
    permisos(id: number): Promise<any>;
    crear(dto: CreateUsuarioDto): Promise<import("../auth/infrastructure/persistence/models/user.model").UserModel>;
    actualizar(id: number, dto: UpdateUsuarioDto, req: AuthRequest): Promise<import("../auth/infrastructure/persistence/models/user.model").UserModel>;
    desactivar(id: number, req: AuthRequest): Promise<import("../auth/infrastructure/persistence/models/user.model").UserModel>;
    activar(id: number): Promise<import("../auth/infrastructure/persistence/models/user.model").UserModel>;
    eliminar(id: number, req: AuthRequest): Promise<{
        message: string;
        id: number;
    }>;
}
export declare class RolesController {
    private readonly admin;
    constructor(admin: AdminService);
    listar(): Promise<object[]>;
    crear(dto: RoleDto): Promise<import("../auth/infrastructure/persistence/models/role.model").RoleModel>;
    actualizar(id: number, dto: RoleDto): Promise<import("../auth/infrastructure/persistence/models/role.model").RoleModel>;
    eliminar(id: number): Promise<{
        message: string;
        id: number;
    }>;
}
export declare class RecursosController {
    private readonly admin;
    constructor(admin: AdminService);
    listar(): Promise<import("../auth/infrastructure/persistence/models/resource.model").ResourceModel[]>;
    crear(dto: CreateRecursoDto): Promise<import("../auth/infrastructure/persistence/models/resource.model").ResourceModel>;
    actualizar(id: number, dto: UpdateRecursoDto): Promise<import("../auth/infrastructure/persistence/models/resource.model").ResourceModel>;
    eliminar(id: number): Promise<{
        message: string;
        id: number;
    }>;
}
export declare class ConcesionesController {
    private readonly admin;
    constructor(admin: AdminService);
    listar(roleId?: string): Promise<object[]>;
    conceder(dto: ConcesionDto): Promise<object>;
    revocar(roleId: number, resourceId: number): Promise<{
        message: string;
        role_id: number;
        resource_id: number;
    }>;
}
export {};
