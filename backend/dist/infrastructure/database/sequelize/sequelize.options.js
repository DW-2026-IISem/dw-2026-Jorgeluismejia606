"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequelizeOptions = void 0;
const user_model_1 = require("../../../features/auth/infrastructure/persistence/models/user.model");
const role_model_1 = require("../../../features/auth/infrastructure/persistence/models/role.model");
const resource_model_1 = require("../../../features/auth/infrastructure/persistence/models/resource.model");
const role_resource_model_1 = require("../../../features/auth/infrastructure/persistence/models/role-resource.model");
const lector_model_1 = require("../../../features/business/lectores/infrastructure/persistence/models/lector.model");
const categoria_model_1 = require("../../../features/business/categorias/infrastructure/persistence/models/categoria.model");
const libro_model_1 = require("../../../features/business/libros/infrastructure/persistence/models/libro.model");
const prestamo_model_1 = require("../../../features/business/prestamos/infrastructure/persistence/models/prestamo.model");
const ejemplar_model_1 = require("../../../features/business/ejemplares/infrastructure/persistence/models/ejemplar.model");
const sede_model_1 = require("../../../features/business/sedes/infrastructure/persistence/models/sede.model");
const autor_model_1 = require("../../../features/business/autores/infrastructure/persistence/models/autor.model");
const reserva_model_1 = require("../../../features/business/reservas/infrastructure/persistence/models/reserva.model");
const multa_model_1 = require("../../../features/business/multas/infrastructure/persistence/models/multa.model");
const getSequelizeOptions = (config) => {
    const dialect = ((typeof config?.get === 'function' ? config.get('DB_DIALECT') : config?.dialect) ||
        process.env.DB_DIALECT ||
        'sqlite');
    const storage = (typeof config?.get === 'function' ? config.get('DB_SQLITE_STORAGE') : (config?.storage || config?.database)) ||
        process.env.DB_SQLITE_STORAGE ||
        'lectura_abierta.db';
    return {
        dialect,
        storage,
        logging: false,
        models: [
            user_model_1.UserModel,
            role_model_1.RoleModel,
            resource_model_1.ResourceModel,
            role_resource_model_1.RoleResourceModel,
            lector_model_1.LectorModel,
            categoria_model_1.CategoriaModel,
            sede_model_1.SedeModel,
            autor_model_1.AutorModel,
            libro_model_1.LibroModel,
            ejemplar_model_1.EjemplarModel,
            prestamo_model_1.PrestamoModel,
            reserva_model_1.ReservaModel,
            multa_model_1.MultaModel,
        ],
        define: {
            timestamps: true,
            underscored: true,
        },
    };
};
exports.getSequelizeOptions = getSequelizeOptions;
//# sourceMappingURL=sequelize.options.js.map