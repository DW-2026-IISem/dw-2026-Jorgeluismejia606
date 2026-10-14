# Retrospectiva Técnica - Segundo Parcial (LecturaAbierta API)

**Materia:** Desarrollo Web / Ingeniería de Software  
**Estudiante:** Jorge Luis Mejía Mejía  
**Fecha:** Octubre 2026  
**Repositorio:** lecturaabierta-api  
**Rama:** lecturaabierta_api_V1  

---

## 1. Objetivos del Hito

El objetivo principal de esta etapa consistió en evolucionar la API backend de **LecturaAbierta** hacia un estándar de producción, incorporando:
- Persistencia robusta sobre SQLite mediante Sequelize-TypeScript con resolución de restricciones relacionales.
- Mecanismo completo de autenticación y autorización (Hashing SHA-256, Access JWT, Refresh Tokens y RBAC).
- Matriz de control de acceso en 4 niveles sobre entidades clave (`Lectores` y `Prestamos`).
- Contenerización segura mediante Dockerfile multi-stage ejecutado por un usuario sin privilegios (`no-root`).
- Automatización de integración continua mediante GitHub Actions (CI/CD).
- Endpoint de observabilidad y comprobación de estado (`/api/health`).

---

## 2. Lo que Funcionó Bien (Aciertos)

1. **Arquitectura Modular por Características (Feature-Based):**
   - La separación en módulos independientes (`auth`, `business/lectores`, `business/prestamos`, `health`) facilitó la inyección de dependencias y el aislamiento de responsabilidades.
2. **Matriz de Seguridad Progresiva:**
   - La implementación escalonada (Público -> API Key Básica -> JWT Bearer -> JWT + RBAC) permitió validar los flujos exitosos (`200 OK`, `201 Created`) y los escenarios de rechazo controlados (`401 Unauthorized`, `403 Forbidden`).
3. **Contenerización Segura (D2):**
   - El uso de Alpine Linux combinado con el usuario de sistema `node` garantiza que la imagen cumpla con el principio de menor privilegio en entornos de despliegue.
4. **Verificación Automática en CI/CD:**
   - El pipeline en GitHub Actions valida que cada commit compile limpiamente en TypeScript y construya la imagen Docker antes de aceptar cambios.

---

## 3. Retos Técnicos y Soluciones Implementadas

| Reto / Dificultad | Causa Raíz | Solución Técnica Aplicada |
| :--- | :--- | :--- |
| **Fallo de integridad referencial al iniciar Sequelize** | La opción `alter: true` en SQLite intenta recrear tablas (`DROP TABLE`) ignorando llaves foráneas activas. | Se ajustó la sincronización a `{ force: false, alter: false }` en `sequelize.module.ts` y se centralizó el catálogo completo de modelos. |
| **Error en factory de base de datos (`DatabaseConfig` vs `ConfigService`)** | Discrepancia en la firma de tipos entre el servicio inyectado y las opciones de Sequelize. | Se normalizó `sequelize.options.ts` para resolver parámetros dinámicamente mediante `config.get()` o acceso directo a variables de entorno. |
| **Manejo de rutas en controladores NestJS** | Desalineación en subdirectorios de presentación (`presentation/controllers` vs `presentation/http/controllers`). | Inspección estructurada del árbol de carpetas con `find` y corrección de las importaciones relativas hacia los guards de `auth`. |

---

## 4. Compromisos de Mejora para la Siguiente Iteración

1. **Migración a Base de Datos de Servidor:**
   - Migrar del motor emulado SQLite a un contenedor PostgreSQL dedicado para soportar migraciones concurrentes avanzadas y operaciones DDL sin bloqueos de tabla.
2. **Pruebas Automatizadas Unitarias y E2E:**
   - Escribir suites con Jest y Supertest para automatizar la ejecución de la batería HTTP descrita en `pruebas_accesos.http` dentro del pipeline de GitHub Actions.
3. **Manejo de Secretos:**
   - Reemplazar valores de respaldo de tokens por inyección estricta desde GitHub Secrets o un gestor centralizado de variables de entorno.
