"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrestamosModule = void 0;
const common_1 = require("@nestjs/common");
const prestamos_service_1 = require("./application/use-cases/prestamos.service");
const prestamos_controller_1 = require("./presentation/http/controllers/prestamos.controller");
let PrestamosModule = class PrestamosModule {
};
exports.PrestamosModule = PrestamosModule;
exports.PrestamosModule = PrestamosModule = __decorate([
    (0, common_1.Module)({
        controllers: [prestamos_controller_1.PrestamosController],
        providers: [prestamos_service_1.PrestamosBusinessService],
        exports: [prestamos_service_1.PrestamosBusinessService],
    })
], PrestamosModule);
//# sourceMappingURL=prestamos.module.js.map