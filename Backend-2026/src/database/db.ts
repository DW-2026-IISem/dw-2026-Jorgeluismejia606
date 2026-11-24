import path from "path";
import dotenv from "dotenv";
import { Dialect, Options, Sequelize } from "sequelize";

dotenv.config();

/**
 * Infraestructura Sequelize (ISS-02).
 * El motor se elige con DB_ENGINE; SQLite es el valor por defecto del laboratorio.
 */
type Engine = "sqlite" | "mysql" | "postgres" | "mssql" | "oracle";

interface NetworkConfig {
  dialect: Dialect;
  host: string;
  username: string;
  password: string;
  database: string;
  port: number;
}

function network(prefix: string, dialect: Dialect, port: string): NetworkConfig {
  const env = process.env;
  return {
    dialect,
    host: env[`${prefix}_HOST`] || "localhost",
    username: env[`${prefix}_USER`] || "",
    password: env[`${prefix}_PASSWORD`] || "",
    database: env[`${prefix}_NAME`] || "lectura_abierta",
    port: parseInt(env[`${prefix}_PORT`] || port, 10),
  };
}

const networkConfigs: Record<Exclude<Engine, "sqlite">, NetworkConfig> = {
  mysql: network("MYSQL", "mysql", "3306"),
  postgres: network("POSTGRES", "postgres", "5432"),
  mssql: network("MSSQL", "mssql", "1433"),
  oracle: network("ORACLE", "oracle", "1521"),
};

export const selectedEngine = (process.env.DB_ENGINE || "sqlite").toLowerCase() as Engine;

if (selectedEngine !== "sqlite" && !(selectedEngine in networkConfigs)) {
  throw new Error(`Motor de base de datos no soportado: ${selectedEngine}`);
}

const common: Options = {
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
};

const sqliteStorage = path.resolve(
  __dirname,
  "..",
  "..",
  process.env.SQLITE_STORAGE || "lectura_abierta.db",
);

export const sequelize =
  selectedEngine === "sqlite"
    ? new Sequelize({ ...common, dialect: "sqlite", storage: sqliteStorage })
    : (() => {
        const cfg = networkConfigs[selectedEngine];
        return new Sequelize(cfg.database, cfg.username, cfg.password, {
          ...common,
          host: cfg.host,
          port: cfg.port,
          dialect: cfg.dialect,
        });
      })();

export const getDatabaseInfo = () =>
  selectedEngine === "sqlite"
    ? { engine: selectedEngine, connectionString: `sqlite://${sqliteStorage}` }
    : (() => {
        const cfg = networkConfigs[selectedEngine];
        return {
          engine: selectedEngine,
          connectionString: `${cfg.dialect}://${cfg.username}@${cfg.host}:${cfg.port}/${cfg.database}`,
        };
      })();

export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión exitosa a ${selectedEngine.toUpperCase()}`);
    return true;
  } catch (error) {
    console.error(`❌ Error de conexión a ${selectedEngine.toUpperCase()}:`, error);
    return false;
  }
};

/**
 * `alter: true` en SQLite recrea tablas y choca con índices únicos;
 * por eso solo se usa en los motores de red.
 */
export const syncDatabase = () => sequelize.sync({ alter: selectedEngine !== "sqlite" });
