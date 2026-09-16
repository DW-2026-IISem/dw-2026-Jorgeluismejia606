export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum DatabaseDialect {
  SQLite = 'sqlite',
  MySQL = 'mysql',
  Postgres = 'postgres',
  MSSQL = 'mssql',
}

export interface AppConfig {
  port: number;
  nodeEnv: Environment;
}

export interface DatabaseConfig {
  dialect: DatabaseDialect;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  storage?: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}
