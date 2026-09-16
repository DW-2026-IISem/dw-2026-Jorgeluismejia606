import { SequelizeOptions } from 'sequelize-typescript';
import { DatabaseConfig, DatabaseDialect } from '../../../config/environment/env.interface';

export function getSequelizeOptions(config: DatabaseConfig): SequelizeOptions {
  const base: SequelizeOptions = {
    dialect: config.dialect as any,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: true,
    },
  };

  if (config.dialect === DatabaseDialect.SQLite) {
    return {
      ...base,
      storage: config.storage || 'lectura_abierta.db',
    };
  }

  return {
    ...base,
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
  };
}
