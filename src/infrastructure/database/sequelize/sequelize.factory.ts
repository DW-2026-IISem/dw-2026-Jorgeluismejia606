import { Sequelize } from 'sequelize-typescript';
import { DatabaseConfig } from '../../../config/environment/env.interface';
import { getSequelizeOptions } from './sequelize.options';

import { LectorModel } from '../../../features/business/lectores/infrastructure/persistence/models/lector.model';
import { CategoriaModel } from '../../../features/business/categorias/infrastructure/persistence/models/categoria.model';
import { AutorModel } from '../../../features/business/autores/infrastructure/persistence/models/autor.model';
import { SedeModel } from '../../../features/business/sedes/infrastructure/persistence/models/sede.model';
import { LibroModel } from '../../../features/business/libros/infrastructure/persistence/models/libro.model';
import { LibroAutorModel } from '../../../features/business/libros/infrastructure/persistence/models/libro-autor.model';
import { EjemplarModel } from '../../../features/business/ejemplares/infrastructure/persistence/models/ejemplar.model';
import { PrestamoModel } from '../../../features/business/prestamos/infrastructure/persistence/models/prestamo.model';
import { ReservaModel } from '../../../features/business/reservas/infrastructure/persistence/models/reserva.model';
import { MultaModel } from '../../../features/business/multas/infrastructure/persistence/models/multa.model';

export const ALL_MODELS: any[] = [
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
];

export async function createSequelizeInstance(config: DatabaseConfig): Promise<Sequelize> {
  const options = getSequelizeOptions(config);
  const sequelize = new Sequelize({ ...options, models: ALL_MODELS });
  await sequelize.authenticate();
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: false });
  }
  return sequelize;
}
