"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequelizeDatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_options_1 = require("./sequelize.options");
let SequelizeDatabaseModule = class SequelizeDatabaseModule {
};
exports.SequelizeDatabaseModule = SequelizeDatabaseModule;
exports.SequelizeDatabaseModule = SequelizeDatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: 'SEQUELIZE',
                useFactory: async (configService) => {
                    const options = (0, sequelize_options_1.getSequelizeOptions)(configService);
                    const sequelize = new sequelize_typescript_1.Sequelize(options);
                    await sequelize.authenticate();
                    await sequelize.sync({ force: false, alter: false });
                    return sequelize;
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: ['SEQUELIZE'],
    })
], SequelizeDatabaseModule);
//# sourceMappingURL=sequelize.module.js.map