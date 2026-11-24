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
exports.MultaModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const enums_1 = require("../../../../../../common/enums");
const prestamo_model_1 = require("../../../../prestamos/infrastructure/persistence/models/prestamo.model");
let MultaModel = class MultaModel extends sequelize_typescript_1.Model {
};
exports.MultaModel = MultaModel;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], MultaModel.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => prestamo_model_1.PrestamoModel),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], MultaModel.prototype, "prestamo_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(150), allowNull: false }),
    __metadata("design:type", String)
], MultaModel.prototype, "nombre", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(255), allowNull: true }),
    __metadata("design:type", String)
], MultaModel.prototype, "descripcion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, allowNull: false }),
    __metadata("design:type", Number)
], MultaModel.prototype, "monto", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(enums_1.EstadoMulta)),
        allowNull: false,
        defaultValue: enums_1.EstadoMulta.PENDIENTE,
    }),
    __metadata("design:type", String)
], MultaModel.prototype, "estado", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], MultaModel.prototype, "fecha_generacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], MultaModel.prototype, "fecha_pago", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: true }),
    __metadata("design:type", Boolean)
], MultaModel.prototype, "is_active", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => prestamo_model_1.PrestamoModel),
    __metadata("design:type", typeof (_a = typeof prestamo_model_1.PrestamoModel !== "undefined" && prestamo_model_1.PrestamoModel) === "function" ? _a : Object)
], MultaModel.prototype, "prestamo", void 0);
exports.MultaModel = MultaModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'multas' })
], MultaModel);
//# sourceMappingURL=multa.model.js.map