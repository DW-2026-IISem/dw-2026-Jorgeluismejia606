import { SequelizeOptions } from 'sequelize-typescript';
import { UserModel } from '../../../features/auth/infrastructure/persistence/models/user.model';
import { LectorModel } from '../../../features/business/lectores/infrastructure/persistence/models/lector.model';
import { CategoriaModel } from '../../../features/business/categorias/infrastructure/persistence/models/categoria.model';
import { LibroModel } from '../../../features/business/libros/infrastructure/persistence/models/libro.model';
import { PrestamoModel } from '../../../features/business/prestamos/infrastructure/persistence/models/prestamo.model';
import { EjemplarModel } from '../../../features/business/ejemplares/infrastructure/persistence/models/ejemplar.model';
import { SedeModel } from '../../../features/business/sedes/infrastructure/persistence/models/sede.model';
import { AutorModel } from '../../../features/business/autores/infrastructure/persistence/models/autor.model';
import { ReservaModel } from '../../../features/business/reservas/infrastructure/persistence/models/reserva.model';
import { MultaModel } from '../../../features/business/multas/infrastructure/persistence/models/multa.model';

export const getSequelizeOptions = (config?: any): SequelizeOptions => {
  const dialect = (
    (typeof config?.get === 'function' ? config.get('DB_DIALECT') : config?.dialect) ||
    process.env.DB_DIALECT ||
    'sqlite'
  ) as any;

  const storage =
    (typeof config?.get === 'function' ? config.get('DB_SQLITE_STORAGE') : (config?.storage || config?.database)) ||
    process.env.DB_SQLITE_STORAGE ||
    'lectura_abierta.db';

  return {
    dialect,
    storage,
    logging: false,
    models: [
      UserModel,
      LectorModel,
      CategoriaModel,
      SedeModel,
      AutorModel,
      LibroModel,
      EjemplarModel,
      PrestamoModel,
      ReservaModel,
      MultaModel,
    ],
    define: {
      timestamps: true,
      underscored: true,
    },
  };
};
