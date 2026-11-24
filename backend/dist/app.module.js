"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const env_validation_1 = require("./config/environment/env.validation");
const sequelize_module_1 = require("./infrastructure/database/sequelize/sequelize.module");
const security_module_1 = require("./infrastructure/security/security.module");
const business_module_1 = require("./features/business/business.module");
const auth_module_1 = require("./features/auth/auth.module");
const admin_module_1 = require("./features/admin/admin.module");
const health_module_1 = require("./features/health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: env_validation_1.validate,
            }),
            sequelize_module_1.SequelizeDatabaseModule,
            security_module_1.SecurityModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            business_module_1.BusinessModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map