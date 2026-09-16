import { LectorModel } from '../../../features/business/lectores/infrastructure/persistence/models/lector.model';
import { CategoriaModel } from '../../../features/business/categorias/infrastructure/persistence/models/categoria.model';
import { AutorModel } from '../../../features/business/autores/infrastructure/persistence/models/autor.model';
import { SedeModel } from '../../../features/business/sedes/infrastructure/persistence/models/sede.model';
import { LibroModel } from '../../../features/business/libros/infrastructure/persistence/models/libro.model';
import { LibroAutorModel } from '../../../features/business/libros/infrastructure/persistence/models/libro-autor.model';
import { EjemplarModel } from '../../../features/business/ejemplares/infrastructure/persistence/models/ejemplar.model';
import { EstadoEjemplar } from '../../../common/enums';

export async function seedDemoCatalog(): Promise<void> {
  if ((await CategoriaModel.count()) > 0) return;

  const cat = await CategoriaModel.create({ nombre: 'Realismo Mágico', descripcion: 'Literatura latinoamericana' });
  const autor = await AutorModel.create({ nombre: 'Gabriel García Márquez', descripcion: 'Premio Nobel de Literatura' });
  const sede = await SedeModel.create({ nombre: 'Sede Central Bogotá', descripcion: 'Biblioteca Principal' });

  const libro = await LibroModel.create({
    nombre: 'Cien Años de Soledad',
    categoria_id: cat.id,
    descripcion: 'Edición conmemorativa',
  });

  await LibroAutorModel.create({
    principal_id: libro.id,
    relacionado_id: autor.id,
    datos_relacion: 'Autor principal',
  });

  // Ejemplar 1: DISPONIBLE
  await EjemplarModel.create({
    libro_id: libro.id,
    sede_id: sede.id,
    nombre: 'Copia 01 - Sala General',
    estado: EstadoEjemplar.DISPONIBLE,
  });

  // Ejemplar 2: MANTENIMIENTO (Para probar rechazo RN-01)
  await EjemplarModel.create({
    libro_id: libro.id,
    sede_id: sede.id,
    nombre: 'Copia 02 - Restauración',
    estado: EstadoEjemplar.MANTENIMIENTO,
  });

  await LectorModel.create({
    nombre: 'Jorge Luis Mejía Mejía',
    descripcion: 'Investigador Principal',
  });

  console.log('✅ Catálogo demo inicial sembrado con éxito');
}
