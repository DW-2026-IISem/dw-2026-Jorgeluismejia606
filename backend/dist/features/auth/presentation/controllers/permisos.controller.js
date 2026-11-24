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
exports.PermisosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../../application/use-cases/auth.service");
const jwt_auth_guard_1 = require("../../infrastructure/guards/jwt-auth.guard");
const raw_response_decorator_1 = require("../../infrastructure/decorators/raw-response.decorator");
let PermisosController = class PermisosController {
    constructor(authService) {
        this.authService = authService;
    }
    permisos(req) {
        return this.authService.permisosEfectivos(req.user.rol);
    }
};
exports.PermisosController = PermisosController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Permisos efectivos del usuario autenticado (JWT)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PermisosController.prototype, "permisos", null);
exports.PermisosController = PermisosController = __decorate([
    (0, swagger_1.ApiTags)('Permisos'),
    (0, raw_response_decorator_1.RawResponse)(),
    (0, common_1.Controller)('permisos'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], PermisosController);
//# sourceMappingURL=permisos.controller.js.map