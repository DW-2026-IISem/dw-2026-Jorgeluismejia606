import { faker } from '@faker-js/faker';
import { Sequelize } from 'sequelize-typescript';
import { resolveSeedCounts } from './counts';
import { CategoriaModel } from '../../features/business/categorias/infrastructure/persistence/models/categoria.model';
import { LectorModel } from '../../features/business/lectores/infrastructure/persistence/models/lector.model';
import { LibroModel } from '../../features/business/libros/infrastructure/persistence/models/libro.model';
import { SedeModel } from '../../features/business/sedes/infrastructure/persistence/models/sede.model';
import { AutorModel } from '../../features/business/autores/infrastructure/persistence/models/autor.model';
import { LibroAutorModel } from '../../features/business/libros/infrastructure/persistence/models/libro-autor.model';
import { EjemplarModel } from '../../features/business/ejemplares/infrastructure/persistence/models/ejemplar.model';
import { PrestamoModel } from '../../features/business/prestamos/infrastructure/persistence/models/prestamo.model';
import { ReservaModel } from '../../features/business/reservas/infrastructure/persistence/models/reserva.model';
import { MultaModel } from '../../features/business/multas/infrastructure/persistence/models/multa.model';

async function runAllSeeders() {
  const counts = resolveSeedCounts();
  console.log('🌱 Iniciando SeedersRunner de LecturaAbierta...');
  console.log('📊 Conteos configurados:', counts);

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'lectura_abierta.db',
    logging: false,
    models: [
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
  await sequelize.sync({ force: false, alter: true });

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

  console.log('🌱 SeedersRunner finalizado con éxito.');
  await sequelize.close();
}

runAllSeeders().catch((err) => {
  console.error('❌ Error en SeedersRunner:', err);
  process.exit(1);
});
