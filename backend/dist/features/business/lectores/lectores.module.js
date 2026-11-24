"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LectoresModule = void 0;
const common_1 = require("@nestjs/common");
const lector_repository_interface_1 = require("./domain/interfaces/lector-repository.interface");
const lector_repository_1 = require("./infrastructure/persistence/repositories/lector.repository");
const create_lector_use_case_1 = require("./application/use-cases/create-lector.use-case");
const lectores_service_1 = require("./application/use-cases/lectores.service");
const lectores_controller_1 = require("./presentation/http/controllers/lectores.controller");
let LectoresModule = class LectoresModule {
};
exports.LectoresModule = LectoresModule;
exports.LectoresModule = LectoresModule = __decorate([
    (0, common_1.Module)({
        controllers: [lectores_controller_1.LectoresController],
        providers: [
            lector_repository_1.LectorRepository,
            { provide: lector_repository_interface_1.LECTOR_REPOSITORY, useExisting: lector_repository_1.LectorRepository },
            create_lector_use_case_1.CreateLectorUseCase,
            lectores_service_1.LectoresService,
        ],
        exports: [lector_repository_interface_1.LECTOR_REPOSITORY],
    })
], LectoresModule);
//# sourceMappingURL=lectores.module.js.map