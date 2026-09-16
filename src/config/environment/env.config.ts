import { registerAs } from '@nestjs/config';
import { DatabaseDialect, Environment } from './env.interface';
import { validate } from './env.validation';

export const ENV_CONFIG_NAME = 'environment';

export const envConfig = registerAs(ENV_CONFIG_NAME, () => {
  const validated = validate(process.env);
  return {
    app: {
      port: validated.PORT,
      nodeEnv: validated.NODE_ENV ?? Environment.Development,
    },
    database: {
      dialect: validated.DB_DIALECT,
      storage: validated.DB_SQLITE_STORAGE,
      host: process.env.DB_MYSQL_HOST || process.env.DB_POSTGRES_HOST,
      port: Number(process.env.DB_MYSQL_PORT || process.env.DB_POSTGRES_PORT),
      username: process.env.DB_MYSQL_USERNAME || process.env.DB_POSTGRES_USERNAME,
      password: process.env.DB_MYSQL_PASSWORD || process.env.DB_POSTGRES_PASSWORD,
      database: process.env.DB_MYSQL_NAME || process.env.DB_POSTGRES_NAME,
    },
    jwt: {
      secret: validated.JWT_SECRET,
      expiresIn: validated.JWT_EXPIRES_IN,
      refreshSecret: validated.JWT_REFRESH_SECRET,
      refreshExpiresIn: validated.JWT_REFRESH_EXPIRES_IN,
    },
  };
});
