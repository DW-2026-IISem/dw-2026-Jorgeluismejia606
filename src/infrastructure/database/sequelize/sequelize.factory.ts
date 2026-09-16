import { Sequelize } from 'sequelize-typescript';
import { DatabaseConfig } from '../../../config/environment/env.interface';
import { getSequelizeOptions } from './sequelize.options';

export const ALL_MODELS: any[] = [];

export async function createSequelizeInstance(config: DatabaseConfig): Promise<Sequelize> {
  const options = getSequelizeOptions(config);
  const sequelize = new Sequelize({
    ...options,
    models: ALL_MODELS,
  });

  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión establecida exitosamente con el motor [${config.dialect.toUpperCase()}]`);
  } catch (error: any) {
    console.error(`❌ Error al conectar con la base de datos: ${error.message}`);
    throw error;
  }

  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: false });
    console.log('✅ Esquema sincronizado automáticamente con la base de datos');
  }

  return sequelize;
}
