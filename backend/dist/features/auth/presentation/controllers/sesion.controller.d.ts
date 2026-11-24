import { AuthService } from '../../application/use-cases/auth.service';
import { SesionLoginDto } from '../dto/sesion-login.dto';
import { SesionLogoutDto, SesionRefreshDto } from '../dto/sesion-refresh.dto';
export declare class SesionController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: SesionLoginDto): any;
    perfil(req: {
        user: {
            sub: number;
        };
    }): any;
    refresh(dto: SesionRefreshDto): any;
    logout(dto: SesionLogoutDto): any;
}
