import { Sequelize } from 'sequelize-typescript';
import { DatabaseConfig } from '../../../config/environment/env.interface';
import { getSequelizeOptions } from './sequelize.options';
import { LectorModel } from '../../../features/business/lectores/infrastructure/persistence/models/lector.model';

export const ALL_MODELS: any[] = [
  LectorModel,
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
