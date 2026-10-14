# LecturaAbierta API

Backend REST para la **Red de Bibliotecas LecturaAbierta**: gestión de lectores, libros,
categorías, ejemplares, préstamos, reservas, multas y usuarios, con autenticación y
autorización en 4 niveles.

## Stack

- **NestJS** (sobre Express 5) + **TypeScript**
- **Sequelize** (`sequelize-typescript`) con dialecto **SQLite** por defecto (multi-dialecto: MySQL/PostgreSQL/MSSQL)
- **JWT** (access + refresh con rotación) + **RBAC** + autenticación por API Key
- **Swagger / OpenAPI** en `/api/docs`

## Requisitos

- Node.js 20+ y npm
- Variables de entorno basadas en `.env.example`

## Puesta en marcha

```bash
npm install
cp .env.example .env      # ajustar credenciales si aplica
npm run start:dev         # http://localhost:4000/api
```

- API: http://localhost:4000/api
- Swagger UI: http://localhost:4000/api/docs
- OpenAPI JSON: http://localhost:4000/api/docs-json
- Health: http://localhost:4000/api/health

## Comandos

```bash
npm run build        # compilación de producción
npm run start:dev    # desarrollo con recarga
npm run start:prod   # ejecutar dist/
npm run lint         # oxlint
npm run test:e2e     # pruebas de extremo a extremo (4 niveles de acceso)
npm run db:seed      # datos de demostración
npx tsc --noEmit     # verificación de tipos
```

## Niveles de acceso

| Nivel | Mecanismo | Ejemplo (Lectores) | Ejemplo (Préstamos) |
| :--- | :--- | :--- | :--- |
| 1 | Sin autenticación | `GET /api/lectores/publico` | `GET /api/prestamos/estadisticas-publicas` |
| 2 | `x-api-key` | `GET /api/lectores/autenticado-basico` | `GET /api/prestamos/resumen-interno` |
| 3 | JWT Bearer + Refresh | `GET /api/lectores/jwt` | `GET /api/prestamos` |
| 4 | JWT + Refresh + RBAC | `POST /api/lectores` (ADMIN) | `POST /api/prestamos` (ADMIN/BIBLIOTECARIO) |

## Autenticación

```bash
# Registro
curl -X POST http://localhost:4000/api/auth/registro \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Admin","email":"admin@lecturaabierta.com","password":"Password123*","rol":"ADMIN"}'

# Login -> { accessToken, refreshToken }
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lecturaabierta.com","password":"Password123*"}'

# Uso del token
curl http://localhost:4000/api/prestamos -H 'Authorization: Bearer <accessToken>'

# Rotación de tokens
curl -X POST http://localhost:4000/api/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refreshToken>"}'
```

## Arquitectura

```
src/
├── config/            # entorno tipado + Swagger
├── common/            # filtros, interceptores, enums
├── infrastructure/    # Sequelize, seguridad (bcrypt/JWT)
└── features/
    ├── auth/          # registro, login, refresh, guards (basic/JWT/RBAC)
    ├── health/        # /api/health
    └── business/      # lectores, prestamos, libros, categorias, ...
```

## Documentación adicional

- `proceso.md` — bitácora por ISS, paso a paso y matrices de pruebas (HTTP + Swagger).
- `pruebas_accesos.http` — colección ejecutable con REST Client que recorre los 4 niveles.
