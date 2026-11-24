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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SesionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../../application/use-cases/auth.service");
const sesion_login_dto_1 = require("../dto/sesion-login.dto");
const sesion_refresh_dto_1 = require("../dto/sesion-refresh.dto");
const jwt_auth_guard_1 = require("../../infrastructure/guards/jwt-auth.guard");
const raw_response_decorator_1 = require("../../infrastructure/decorators/raw-response.decorator");
let SesionController = class SesionController {
    constructor(authService) {
        this.authService = authService;
    }
    login(dto) {
        return this.authService.sesionLogin(dto);
    }
    perfil(req) {
        return this.authService.perfil(req.user.sub);
    }
    refresh(dto) {
        return this.authService.sesionRefresh(dto.refresh_token);
    }
    logout(dto) {
        return this.authService.sesionLogout(dto.refresh_token);
    }
};
exports.SesionController = SesionController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar sesión con usuario o correo (abierto)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'access_token, refresh_token y tiempos de expiración (HTTP 200)' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Credenciales inválidas (HTTP 401)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sesion_login_dto_1.SesionLoginDto]),
    __metadata("design:returntype", void 0)
], SesionController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('perfil'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Perfil del usuario autenticado (JWT)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SesionController.prototype, "perfil", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Renovar el par de tokens con rotación (abierto, refresh en el cuerpo)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Nuevo par de tokens; el refresh anterior deja de servir (HTTP 200)' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Refresh inválido, expirado o ya rotado (HTTP 401)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sesion_refresh_dto_1.SesionRefreshDto]),
    __metadata("design:returntype", void 0)
], SesionController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar sesión: revoca el refresh presentado (idempotente)' }),
    (0, swagger_1.ApiOkResponse)({ description: '{ message } siempre, aunque el token ya no sirva (HTTP 200)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sesion_refresh_dto_1.SesionLogoutDto]),
    __metadata("design:returntype", void 0)
], SesionController.prototype, "logout", null);
exports.SesionController = SesionController = __decorate([
    (0, swagger_1.ApiTags)('Sesión'),
    (0, raw_response_decorator_1.RawResponse)(),
    (0, common_1.Controller)('sesion'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], SesionController);
//# sourceMappingURL=sesion.controller.js.map