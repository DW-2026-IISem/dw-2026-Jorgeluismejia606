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
exports.PrestamosBusinessService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_typescript_1 = require("sequelize-typescript");
const database_constants_1 = require("@/common/constants/database.constants");
const prestamo_model_1 = require("@/features/business/prestamos/infrastructure/persistence/models/prestamo.model");
const ejemplar_model_1 = require("@/features/business/ejemplares/infrastructure/persistence/models/ejemplar.model");
const lector_model_1 = require("@/features/business/lectores/infrastructure/persistence/models/lector.model");
const reserva_model_1 = require("@/features/business/reservas/infrastructure/persistence/models/reserva.model");
const multa_model_1 = require("@/features/business/multas/infrastructure/persistence/models/multa.model");
const enums_1 = require("@/common/enums");
let PrestamosBusinessService = class PrestamosBusinessService {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async crear(dto) {
        const lector = await lector_model_1.LectorModel.findByPk(dto.lectorId);
        if (!lector || !lector.is_active)
            throw new common_1.NotFoundException('Lector no registrado o inactivo');
        const ejemplar = await ejemplar_model_1.EjemplarModel.findByPk(dto.ejemplarId);
        if (!ejemplar || !ejemplar.is_active)
            throw new common_1.NotFoundException('Ejemplar no encontrado');
        if (ejemplar.estado !== enums_1.EstadoEjemplar.DISPONIBLE) {
            throw new common_1.BadRequestException(`RN-01: El ejemplar no está DISPONIBLE (Estado: ${ejemplar.estado})`);
        }
        return this.sequelize.transaction(async (t) => {
            await ejemplar.update({ estado: enums_1.EstadoEjemplar.PRESTADO }, { transaction: t });
            return prestamo_model_1.PrestamoModel.create({
                lector_id: dto.lectorId,
                ejemplar_id: dto.ejemplarId,
                fecha_inicio: new Date(),
                fecha_fin: new Date(dto.fechaFin),
                estado: enums_1.EstadoPrestamo.ACTIVO,
                observaciones: dto.observaciones,
            }, { transaction: t });
        });
    }
    async devolver(id, dto) {
        const prestamo = await prestamo_model_1.PrestamoModel.findByPk(id, { include: [ejemplar_model_1.EjemplarModel] });
        if (!prestamo)
            throw new common_1.NotFoundException('Préstamo no encontrado');
        if (prestamo.estado !== enums_1.EstadoPrestamo.ACTIVO) {
            throw new common_1.BadRequestException('El préstamo ya se encuentra finalizado');
        }
        return this.sequelize.transaction(async (t) => {
            const fechaDev = new Date(dto.fechaDevolucion);
            await prestamo.update({
                fecha_devolucion: fechaDev,
                estado: enums_1.EstadoPrestamo.DEVUELTO,
                observaciones: dto.observaciones || prestamo.observaciones,
            }, { transaction: t });
            const ejemplar = await ejemplar_model_1.EjemplarModel.findByPk(prestamo.ejemplar_id, { transaction: t });
            if (dto.perdido) {
                await ejemplar?.update({ estado: enums_1.EstadoEjemplar.PERDIDO }, { transaction: t });
                await multa_model_1.MultaModel.create({
                    prestamo_id: prestamo.id,
                    nombre: 'Pérdida de ejemplar',
                    monto: 50.0,
                    estado: enums_1.EstadoMulta.PENDIENTE,
                    fecha_generacion: new Date(),
                }, { transaction: t });
            }
            else if (dto.danado) {
                await ejemplar?.update({ estado: enums_1.EstadoEjemplar.DANADO }, { transaction: t });
                await multa_model_1.MultaModel.create({
                    prestamo_id: prestamo.id,
                    nombre: 'Daño en ejemplar',
                    monto: 20.0,
                    estado: enums_1.EstadoMulta.PENDIENTE,
                    fecha_generacion: new Date(),
                }, { transaction: t });
            }
            else {
                await ejemplar?.update({ estado: enums_1.EstadoEjemplar.DISPONIBLE }, { transaction: t });
            }
            if (fechaDev.getTime() > prestamo.fecha_fin.getTime()) {
                const diffMs = fechaDev.getTime() - prestamo.fecha_fin.getTime();
                const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                await multa_model_1.MultaModel.create({
                    prestamo_id: prestamo.id,
                    nombre: `Retraso de ${dias} día(s)`,
                    monto: dias * 1.5,
                    estado: enums_1.EstadoMulta.PENDIENTE,
                    fecha_generacion: new Date(),
                }, { transaction: t });
            }
            return prestamo_model_1.PrestamoModel.findByPk(id, { include: [ejemplar_model_1.EjemplarModel, multa_model_1.MultaModel], transaction: t });
        });
    }
    async renovar(id, dto) {
        const prestamo = await prestamo_model_1.PrestamoModel.findByPk(id, { include: [ejemplar_model_1.EjemplarModel] });
        if (!prestamo)
            throw new common_1.NotFoundException('Préstamo no encontrado');
        if (prestamo.estado !== enums_1.EstadoPrestamo.ACTIVO) {
            throw new common_1.BadRequestException('Solo préstamos activos pueden ser renovados');
        }
        const reservasEnEspera = await reserva_model_1.ReservaModel.count({
            where: {
                libro_id: prestamo.ejemplar.libro_id,
                estado: enums_1.EstadoReserva.PENDIENTE,
            },
        });
        if (reservasEnEspera > 0) {
            throw new common_1.ConflictException('RN-05: Existen reservas en espera para este libro; no es posible renovar');
        }
        await prestamo.update({ fecha_fin: new Date(dto.nuevaFechaFin) });
        return prestamo;
    }
};
exports.PrestamosBusinessService = PrestamosBusinessService;
exports.PrestamosBusinessService = PrestamosBusinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_constants_1.SEQUELIZE_TOKEN)),
    __metadata("design:paramtypes", [sequelize_typescript_1.Sequelize])
], PrestamosBusinessService);
//# sourceMappingURL=prestamos.service.js.map