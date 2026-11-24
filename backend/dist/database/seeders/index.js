"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const sequelize_typescript_1 = require("sequelize-typescript");
const counts_1 = require("./counts");
const categoria_model_1 = require("../../features/business/categorias/infrastructure/persistence/models/categoria.model");
const lector_model_1 = require("../../features/business/lectores/infrastructure/persistence/models/lector.model");
const libro_model_1 = require("../../features/business/libros/infrastructure/persistence/models/libro.model");
const user_model_1 = require("../../features/auth/infrastructure/persistence/models/user.model");
const role_model_1 = require("../../features/auth/infrastructure/persistence/models/role.model");
const resource_model_1 = require("../../features/auth/infrastructure/persistence/models/resource.model");
const role_resource_model_1 = require("../../features/auth/infrastructure/persistence/models/role-resource.model");
const auth_seeder_1 = require("./auth.seeder");
const sede_model_1 = require("../../features/business/sedes/infrastructure/persistence/models/sede.model");
const autor_model_1 = require("../../features/business/autores/infrastructure/persistence/models/autor.model");
const libro_autor_model_1 = require("../../features/business/libros/infrastructure/persistence/models/libro-autor.model");
const ejemplar_model_1 = require("../../features/business/ejemplares/infrastructure/persistence/models/ejemplar.model");
const prestamo_model_1 = require("../../features/business/prestamos/infrastructure/persistence/models/prestamo.model");
const reserva_model_1 = require("../../features/business/reservas/infrastructure/persistence/models/reserva.model");
const multa_model_1 = require("../../features/business/multas/infrastructure/persistence/models/multa.model");
const enums_1 = require("../../common/enums");
async function runAllSeeders() {
    const counts = (0, counts_1.resolveSeedCounts)();
    console.log('🌱 Iniciando SeedersRunner de LecturaAbierta...');
    console.log('📊 Conteos configurados:', counts);
    const sequelize = new sequelize_typescript_1.Sequelize({
        dialect: 'sqlite',
        storage: 'lectura_abierta.db',
        logging: false,
        define: { timestamps: true, underscored: true },
        models: [
            user_model_1.UserModel,
            role_model_1.RoleModel,
            resource_model_1.ResourceModel,
            role_resource_model_1.RoleResourceModel,
            lector_model_1.LectorModel,
            categoria_model_1.CategoriaModel,
            autor_model_1.AutorModel,
            sede_model_1.SedeModel,
            libro_model_1.LibroModel,
            libro_autor_model_1.LibroAutorModel,
            ejemplar_model_1.EjemplarModel,
            prestamo_model_1.PrestamoModel,
            reserva_model_1.ReservaModel,
            multa_model_1.MultaModel,
        ],
    });
    await sequelize.authenticate();
    await sequelize.sync({ force: false, alter: false });
    await (0, auth_seeder_1.seedAuth)();
    const catCount = await categoria_model_1.CategoriaModel.count();
    if (catCount === 0) {
        const categorias = Array.from({ length: counts.categorias }, () => ({
            nombre: faker_1.faker.commerce.department(),
            descripcion: faker_1.faker.lorem.sentence(),
            is_active: true,
        }));
        await categoria_model_1.CategoriaModel.bulkCreate(categorias);
        console.log(`✅ Categorías: ${counts.categorias} sembradas`);
    }
    const lectorCount = await lector_model_1.LectorModel.count();
    if (lectorCount === 0) {
        const lectores = Array.from({ length: counts.lectores }, () => ({
            nombre: faker_1.faker.person.fullName(),
            descripcion: faker_1.faker.internet.email().toLowerCase(),
            is_active: true,
        }));
        await lector_model_1.LectorModel.bulkCreate(lectores);
        console.log(`✅ Lectores: ${counts.lectores} sembrados`);
    }
    const libroCount = await libro_model_1.LibroModel.count();
    if (libroCount === 0) {
        const cats = await categoria_model_1.CategoriaModel.findAll();
        if (cats.length > 0) {
            const libros = Array.from({ length: counts.libros }, () => ({
                nombre: faker_1.faker.book.title(),
                descripcion: faker_1.faker.lorem.paragraph(1),
                categoria_id: cats[Math.floor(Math.random() * cats.length)].id,
                is_active: true,
            }));
            await libro_model_1.LibroModel.bulkCreate(libros);
            console.log(`✅ Libros: ${counts.libros} sembrados`);
        }
    }
    const sedeCount = await sede_model_1.SedeModel.count();
    if (sedeCount === 0) {
        await sede_model_1.SedeModel.bulkCreate([
            { nombre: 'Sede Central', descripcion: 'Biblioteca principal', is_active: true },
            { nombre: 'Sede Norte', descripcion: 'Sala de lectura norte', is_active: true },
        ]);
        console.log('✅ Sedes: 2 sembradas');
    }
    const ejemplarCount = await ejemplar_model_1.EjemplarModel.count();
    if (ejemplarCount === 0) {
        const libros = await libro_model_1.LibroModel.findAll();
        const sedes = await sede_model_1.SedeModel.findAll();
        if (libros.length > 0 && sedes.length > 0) {
            const ejemplares = libros.flatMap((libro) => [1, 2].map((n) => ({
                libro_id: libro.id,
                sede_id: sedes[(libro.id + n) % sedes.length].id,
                nombre: `${libro.nombre} · Copia ${n}`,
                descripcion: faker_1.faker.lorem.sentence(),
                estado: enums_1.EstadoEjemplar.DISPONIBLE,
                is_active: true,
            })));
            await ejemplar_model_1.EjemplarModel.bulkCreate(ejemplares);
            console.log(`✅ Ejemplares: ${ejemplares.length} sembrados (DISPONIBLE)`);
        }
    }
    console.log('🌱 SeedersRunner finalizado con éxito.');
    await sequelize.close();
}
runAllSeeders().catch((err) => {
    console.error('❌ Error en SeedersRunner:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map