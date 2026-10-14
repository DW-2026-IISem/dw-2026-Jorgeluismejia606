# LecturaAbierta API

## Objetivo

API REST con **NestJS (sobre Express)**, TypeScript, Sequelize y SQLite para gestionar
bibliotecas, lectores, libros, préstamos, reservas, categorías, autores, sedes y multas,
con **autenticación y autorización en 4 niveles** (público, API Key, JWT + Refresh y RBAC).

## Arquitectura

- `src/app`: bootstrap, módulo raíz y controlador de aplicación.
- `src/config`: configuración tipada, validación de entorno y Swagger.
- `src/common`: excepciones, filtros, interceptores y utilidades compartidas.
- `src/infrastructure`: integración con Sequelize, seguridad, tokens y hashing.
- `src/features/auth`: registro, login, refresh y guards (basic / JWT / RBAC).
- `src/features/health`: endpoint de salud `/api/health`.
- `src/features/business`: módulos de dominio (lectores, préstamos, libros, categorías, …).
- `test`: pruebas de integración de extremo a extremo.

## Niveles de acceso

| Nivel | Mecanismo | Ejemplo |
| :--- | :--- | :--- |
| 1 | Sin autenticación | `GET /api/lectores/publico` |
| 2 | `x-api-key` | `GET /api/prestamos/resumen-interno` |
| 3 | JWT Bearer + Refresh | `GET /api/prestamos` |
| 4 | JWT + Refresh + RBAC | `POST /api/lectores` (ADMIN) |

## Comandos

```bash
npm install
npm run start:dev
npm run test:unit
npm run test:e2e
npm run build
npm run lint
npm run db:seed
```

## Salud

El endpoint `GET /api/health` devuelve el estado del servicio y de la base de datos.
La imagen Docker ejecuta una comprobación automática con el mismo endpoint.

## Documentación

- Swagger UI: `http://localhost:4000/api/docs`
- OpenAPI JSON: `http://localhost:4000/api/docs-json`

## Despliegue

```bash
docker build -t lecturaabierta-api:latest .
docker run --rm -p 4000:4000 --env-file .env lecturaabierta-api:latest
```

## Calidad

El flujo de CI (`.github/workflows/ci-cd.yml`) ejecuta lint, pruebas unitarias, pruebas e2e,
build y la construcción de la imagen Docker.
