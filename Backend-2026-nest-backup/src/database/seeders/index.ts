import { faker } from '@faker-js/faker';
import { Sequelize } from 'sequelize-typescript';
import { resolveSeedCounts } from './counts';
import { CategoriaModel } from '../../features/business/categorias/infrastructure/persistence/models/categoria.model';
import { LectorModel } from '../../features/business/lectores/infrastructure/persistence/models/lector.model';
import { LibroModel } from '../../features/business/libros/infrastructure/persistence/models/libro.model';
import { UserModel } from '../../features/auth/infrastructure/persistence/models/user.model';
import { RoleModel } from '../../features/auth/infrastructure/persistence/models/role.model';
import { ResourceModel } from '../../features/auth/infrastructure/persistence/models/resource.model';
import { RoleResourceModel } from '../../features/auth/infrastructure/persistence/models/role-resource.model';
import { seedAuth } from './auth.seeder';
import { SedeModel } from '../../features/business/sedes/infrastructure/persistence/models/sede.model';
import { AutorModel } from '../../features/business/autores/infrastructure/persistence/models/autor.model';
import { LibroAutorModel } from '../../features/business/libros/infrastructure/persistence/models/libro-autor.model';
import { EjemplarModel } from '../../features/business/ejemplares/infrastructure/persistence/models/ejemplar.model';
import { PrestamoModel } from '../../features/business/prestamos/infrastructure/persistence/models/prestamo.model';
import { ReservaModel } from '../../features/business/reservas/infrastructure/persistence/models/reserva.model';
import { MultaModel } from '../../features/business/multas/infrastructure/persistence/models/multa.model';
import { EstadoEjemplar } from '../../common/enums';

async function runAllSeeders() {
  const counts = resolveSeedCounts();
  console.log('🌱 Iniciando SeedersRunner de LecturaAbierta...');
  console.log('📊 Conteos configurados:', counts);

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'lectura_abierta.db',
    logging: false,
    define: { timestamps: true, underscored: true },
    models: [
      UserModel,
      RoleModel,
      ResourceModel,
      RoleResourceModel,
      LectorModel,
      CategoriaModel,
      AutorModel,
      SedeModel,
      LibroModel,
      LibroAutorModel,
      EjemplarModel,
      PrestamoModel,
      ReservaModel,
      MultaModel,
    ],
  });

  await sequelize.authenticate();
  await sequelize.sync({ force: false, alter: false });

  await seedAuth();

  // 1. Seed Categorías
  const catCount = await CategoriaModel.count();
  if (catCount === 0) {
    const categorias = Array.from({ length: counts.categorias }, () => ({
      nombre: faker.commerce.department(),
      descripcion: faker.lorem.sentence(),
      is_active: true,
    }));
    await CategoriaModel.bulkCreate(categorias);
    console.log(`✅ Categorías: ${counts.categorias} sembradas`);
  }

  // 2. Seed Lectores
  const lectorCount = await LectorModel.count();
  if (lectorCount === 0) {
    const lectores = Array.from({ length: counts.lectores }, () => ({
      nombre: faker.person.fullName(),
      descripcion: faker.internet.email().toLowerCase(),
      is_active: true,
    }));
    await LectorModel.bulkCreate(lectores);
    console.log(`✅ Lectores: ${counts.lectores} sembrados`);
  }

  // 3. Seed Libros
  const libroCount = await LibroModel.count();
  if (libroCount === 0) {
    const cats = await CategoriaModel.findAll();
    if (cats.length > 0) {
      const libros = Array.from({ length: counts.libros }, () => ({
        nombre: faker.book.title(),
        descripcion: faker.lorem.paragraph(1),
        categoria_id: cats[Math.floor(Math.random() * cats.length)].id,
        is_active: true,
      }));
      await LibroModel.bulkCreate(libros);
      console.log(`✅ Libros: ${counts.libros} sembrados`);
    }
  }

  // 4. Seed Sedes (los ejemplares exigen sede_id)
  const sedeCount = await SedeModel.count();
  if (sedeCount === 0) {
    await SedeModel.bulkCreate([
      { nombre: 'Sede Central', descripcion: 'Biblioteca principal', is_active: true },
      { nombre: 'Sede Norte', descripcion: 'Sala de lectura norte', is_active: true },
    ]);
    console.log('✅ Sedes: 2 sembradas');
  }

  // 5. Seed Ejemplares: 2 copias DISPONIBLES por cada libro
  const ejemplarCount = await EjemplarModel.count();
  if (ejemplarCount === 0) {
    const libros = await LibroModel.findAll();
    const sedes = await SedeModel.findAll();
    if (libros.length > 0 && sedes.length > 0) {
      const ejemplares = libros.flatMap((libro) =>
        [1, 2].map((n) => ({
          libro_id: libro.id,
          sede_id: sedes[(libro.id + n) % sedes.length].id,
          nombre: `${libro.nombre} · Copia ${n}`,
          descripcion: faker.lorem.sentence(),
          estado: EstadoEjemplar.DISPONIBLE,
          is_active: true,
        })),
      );
      await EjemplarModel.bulkCreate(ejemplares);
      console.log(`✅ Ejemplares: ${ejemplares.length} sembrados (DISPONIBLE)`);
    }
  }

  // 6. Seed Autores
  const autorCount = await AutorModel.count();
  if (autorCount === 0) {
    const autores = Array.from({ length: 8 }, () => ({
      nombre: faker.person.fullName(),
      descripcion: faker.lorem.sentence(),
      is_active: true,
    }));
    await AutorModel.bulkCreate(autores);
    console.log('✅ Autores: 8 sembrados');
  }

  // 7. Seed relación libro ↔ autor: 1 o 2 autores por libro
  const relacionCount = await LibroAutorModel.count();
  if (relacionCount === 0) {
    const libros = await LibroModel.findAll();
    const autores = await AutorModel.findAll();
    if (libros.length > 0 && autores.length > 1) {
      const relaciones = libros.flatMap((libro, i) => {
        const principal = autores[i % autores.length];
        const filas = [
          { principal_id: libro.id, relacionado_id: principal.id, datos_relacion: 'Autor principal', is_active: true },
        ];
        if (i % 2 === 0) {
          const coautor = autores[(i + 1) % autores.length];
          filas.push({ principal_id: libro.id, relacionado_id: coautor.id, datos_relacion: 'Coautor', is_active: true });
        }
        return filas;
      });
      await LibroAutorModel.bulkCreate(relaciones);
      console.log(`✅ Libro ↔ autor: ${relaciones.length} relaciones sembradas`);
    }
  }

  console.log('🌱 SeedersRunner finalizado con éxito.');
  await sequelize.close();
}

runAllSeeders().catch((err) => {
  console.error('❌ Error en SeedersRunner:', err);
  process.exit(1);
});
