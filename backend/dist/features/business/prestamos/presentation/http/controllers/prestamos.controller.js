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
exports.PrestamosController = void 0;
const permission_guard_1 = require("@/features/auth/infrastructure/guards/permission.guard");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../auth/infrastructure/guards/jwt-auth.guard");
const basic_auth_guard_1 = require("../../../../../auth/infrastructure/guards/basic-auth.guard");
const roles_guard_1 = require("../../../../../auth/infrastructure/guards/roles.guard");
const user_model_1 = require("../../../../../auth/infrastructure/persistence/models/user.model");
const prestamo_model_1 = require("../../../infrastructure/persistence/models/prestamo.model");
const lector_model_1 = require("@/features/business/lectores/infrastructure/persistence/models/lector.model");
const ejemplar_model_1 = require("@/features/business/ejemplares/infrastructure/persistence/models/ejemplar.model");
const libro_model_1 = require("@/features/business/libros/infrastructure/persistence/models/libro.model");
const enums_1 = require("@/common/enums");
const prestamos_service_1 = require("../../../application/use-cases/prestamos.service");
const prestamo_dto_1 = require("../../../application/dto/prestamo.dto");
let PrestamosController = class PrestamosController {
    constructor(service) {
        this.service = service;
    }
    async stats() {
        const total = await prestamo_model_1.PrestamoModel.count();
        return {
            nivel: 'Nivel 1 - Sin autenticacion',
            totalPrestamosRegistrados: total,
        };
    }
    async resumenInterno() {
        return {
            nivel: 'Nivel 2 - Solo autenticacion',
            prestamos: await prestamo_model_1.PrestamoModel.findAll({ limit: 5 }),
        };
    }
    async listarPrestamos() {
        return {
            nivel: 'Nivel 3 - Autenticacion JWT Token',
            data: await prestamo_model_1.PrestamoModel.findAll(),
        };
    }
    async crearPrestamo(body) {
        const prestamo = await prestamo_model_1.PrestamoModel.create(body);
        return {
            nivel: 'Nivel 4 - JWT + RBAC Autorizado',
            data: prestamo,
        };
    }
    listado() {
        return prestamo_model_1.PrestamoModel.findAll({
            include: [lector_model_1.LectorModel, { model: ejemplar_model_1.EjemplarModel, include: [libro_model_1.LibroModel] }],
            order: [['id', 'DESC']],
        });
    }
    registrar(dto) {
        return this.service.crear(dto);
    }
    devolver(id, dto) {
        return this.service.devolver(id, dto);
    }
    renovar(id, dto) {
        return this.service.renovar(id, dto);
    }
    ejemplaresDisponibles() {
        return ejemplar_model_1.EjemplarModel.findAll({
            where: { estado: enums_1.EstadoEjemplar.DISPONIBLE, is_active: true },
            include: [libro_model_1.LibroModel],
            order: [['id', 'ASC']],
        });
    }
};
exports.PrestamosController = PrestamosController;
__decorate([
    (0, common_1.Get)('estadisticas-publicas'),
    (0, swagger_1.ApiOperation)({ summary: '[NIVEL 1] Público: consulta sin credenciales' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Métricas públicas de préstamos (HTTP 200)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('resumen-interno'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, swagger_1.ApiHeader)({
        name: 'x-api-key',
        required: true,
        description: 'Credencial de servicio (por defecto: lectura-abierta-basic-key)',
    }),
    (0, swagger_1.ApiOperation)({ summary: '[NIVEL 2] Solo autenticación básica (x-api-key)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Resumen interno con credencial válida (HTTP 200)' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Falta o es inválida la cabecera x-api-key (HTTP 401)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "resumenInterno", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[NIVEL 3] Autenticación JWT Token + Refresh' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Listado completo con token válido (HTTP 200)' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token Bearer ausente, inválido o expirado (HTTP 401)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "listarPrestamos", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(user_model_1.UserRole.ADMIN, user_model_1.UserRole.BIBLIOTECARIO),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[NIVEL 4] JWT + RBAC: solo ADMIN o BIBLIOTECARIO' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Préstamo creado con rol autorizado (HTTP 201)' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token Bearer ausente, inválido o expirado (HTTP 401)' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'El rol del usuario no está autorizado (HTTP 403)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "crearPrestamo", null);
__decorate([
    (0, common_1.Get)('listado'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar préstamos con lector y ejemplar (RBAC)' }),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrestamosController.prototype, "listado", null);
__decorate([
    (0, common_1.Post)('registrar'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar préstamo transaccional: ejemplar → PRESTADO (RBAC)' }),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prestamo_dto_1.CreatePrestamoDto]),
    __metadata("design:returntype", void 0)
], PrestamosController.prototype, "registrar", null);
__decorate([
    (0, common_1.Patch)(':id/devolver'),
    (0, swagger_1.ApiOperation)({ summary: 'Devolver préstamo transaccional: libera ejemplar y genera multas (RBAC)' }),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, prestamo_dto_1.DevolverPrestamoDto]),
    __metadata("design:returntype", void 0)
], PrestamosController.prototype, "devolver", null);
__decorate([
    (0, common_1.Patch)(':id/renovar'),
    (0, swagger_1.ApiOperation)({ summary: 'Renovar préstamo si no hay reservas pendientes (RBAC)' }),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, prestamo_dto_1.RenovarPrestamoDto]),
    __metadata("design:returntype", void 0)
], PrestamosController.prototype, "renovar", null);
__decorate([
    (0, common_1.Get)('ejemplares-disponibles'),
    (0, swagger_1.ApiOperation)({ summary: 'Catálogo de ejemplares DISPONIBLES con su libro (RBAC)' }),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrestamosController.prototype, "ejemplaresDisponibles", null);
exports.PrestamosController = PrestamosController = __decorate([
    (0, swagger_1.ApiTags)('Business - Prestamos'),
    (0, common_1.Controller)('prestamos'),
    __metadata("design:paramtypes", [prestamos_service_1.PrestamosBusinessService])
], PrestamosController);
//# sourceMappingURL=prestamos.controller.js.map