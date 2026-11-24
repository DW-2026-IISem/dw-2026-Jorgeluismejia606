import dotenv from "dotenv";

dotenv.config();

/** Configuración de autenticación leída una sola vez del `.env`. */
export const authConfig = {
  /** Interruptor de fases: false = Fase I (negocio abierto). */
  enabled: (process.env.AUTH_ENABLED ?? "true").toLowerCase() !== "false",
  jwtSecret: process.env.JWT_SECRET || "",
  accessTtl: parseInt(process.env.JWT_EXPIRES_IN || "900", 10),
  refreshTtl: parseInt(process.env.REFRESH_EXPIRES_IN || "604800", 10),
};

if (!authConfig.jwtSecret || authConfig.jwtSecret.length < 32) {
  throw new Error("JWT_SECRET falta o es muy corto (mínimo 32 caracteres). Revisa el archivo .env");
}
