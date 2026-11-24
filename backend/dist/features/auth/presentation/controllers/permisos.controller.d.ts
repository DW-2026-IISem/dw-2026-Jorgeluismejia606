import { AuthService } from '../../application/use-cases/auth.service';
export declare class PermisosController {
    private readonly authService;
    constructor(authService: AuthService);
    permisos(req: {
        user: {
            rol: string;
        };
    }): any;
}
