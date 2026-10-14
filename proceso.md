# Bitácora de Implementación y Matriz de Pruebas - LecturaAbierta API

**Stack:** NestJS (sobre Express 5) + TypeScript + Sequelize + SQLite
**Puerto de operación:** 4000
**Swagger UI:** http://localhost:4000/api/docs
**OpenAPI JSON:** http://localhost:4000/api/docs-json

---

## 1. Bitácora de commits por cada ISS

| ISS | Commit (cierre) | Mensaje de confirmación | Componentes principales |
| :--- | :---: | :--- | :--- |
| **ISS-01** | `b4dd56b` | `feat: complete base application bootstrap` | `.env`, `main.ts`, `env.validation.ts` |
| **ISS-02** | `45e417f` | `feat(database): ISS-02 integracion de Sequelize con dialecto SQLite y registro centralizado de modelos` | `sequelize.options.ts`, `sequelize.module.ts` |
| **ISS-03** | `8edc2ef` | `feat: complete all business models in Sequelize factory and BusinessModule` | `features/business/*` |
| **ISS-04** | `0758daa` | `feat(auth): ISS-04 modulo de autenticacion con registro, login seguro y hashing de credenciales` | `user.model.ts`, `auth.service.ts`, `auth.controller.ts` |
| **ISS-05** | `875370f` | `feat(auth): ISS-05 implementacion de JWT Bearer, endpoint de refresco y rotacion de refresh tokens` | `jwt-auth.guard.ts`, `refresh-token.dto.ts` |
| **ISS-06** | `bf3c85a` | `feat(security): ISS-06 guardias de autorizacion RBAC por roles y autenticacion basica` | `roles.guard.ts`, `basic-auth.guard.ts` |
| **ISS-07** | `6318230` | `feat(security): ISS-07 aplicacion de los 4 niveles de acceso (publico, basic, jwt, rbac) en lectores y prestamos` | `lectores.controller.ts`, `prestamos.controller.ts` |
| **ISS-08** | `5e0b540` | `docs: ISS-08 adicion de pruebas http, integracion de app.module y proceso.md` | `proceso.md`, `pruebas_accesos.http`, `app.module.ts` |

> **Nota:** ISS-01 y ISS-03 son incrementos amplios; su commit de cierre se indica arriba. El detalle por paso (`ISS-01`, `ISS-02`, …) está en la sección **2. Paso a paso por ISS**.
>
> **Commits de soporte (transversales):** `ea1df6e` (migración a bcrypt), `33f8ccb` (health `/api/health`), `e910450` (Dockerfile + CI), `a00d6a4` (corrección e2e / pipeline), `a0a6e25` (estandarización de puerto 4000).

---

## 2. Paso a paso por ISS

Cada ISS es un incremento verificable. El cierre de cada uno exige `npm run start:dev` (el servidor arranca) y `npx tsc --noEmit` sin errores.

### ISS-00 — Requisitos previos
**Objetivo:** entorno listo.
**Pasos:**
1. `node -v` → v20 o superior.
2. `npm -v`.
3. `npm install`.
4. Definir variables en `.env` a partir de `.env.example` (`PORT=4000`, `DB_DIALECT=sqlite`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `BASIC_API_KEY`).
**Verificación:** `npm run start:dev` levanta el servidor.

### ISS-01 — Esqueleto, entorno y bootstrapping
**Objetivo:** app TypeScript arrancable con configuración validada.
**Pasos:**
1. `npm install` de dependencias base (NestJS, TypeScript, Sequelize).
2. Configurar variables tipadas: `src/config/environment/env.interface.ts` y validación con `class-validator` en `env.validation.ts` (`validate()`).
3. Registrar `ConfigModule.forRoot({ isGlobal: true, validate })` en `src/app.module.ts`.
4. Crear `src/main.ts`: prefijo global `api`, `ValidationPipe`, `GlobalExceptionFilter`, `ResponseInterceptor` y `setupSwagger(app)`.
**Verificación:** `npx tsc --noEmit` OK y `npm run start:dev` responde en `http://localhost:4000/api`.

### ISS-02 — Infraestructura Sequelize + SQLite
**Objetivo:** conexión centralizada y registro de modelos.
**Pasos:**
1. Definir opciones multi-dialecto en `src/infrastructure/database/sequelize/sequelize.options.ts`.
2. Crear el módulo global `SequelizeDatabaseModule` que autentica y hace `sync`.
3. Registrar todos los modelos de `features/**` en `models: [...]`.
**Verificación:** la app arranca y se crean las tablas en `lectura_abierta.db`.

### ISS-03 — Entidades, esquemas relacionales y repositorios base
**Objetivo:** modelos de negocio (Lectores, Categorías, Libros, Préstamos, etc.).
**Pasos:**
1. Modelar entidades con `sequelize-typescript` (`@Table`, `@Column`, `@ForeignKey`).
2. Declarar asociaciones `@BelongsTo`/`@HasMany` (p. ej. `Prestamo`→`Lector`, `Prestamo`→`Ejemplar`).
3. Crear repositorios e interfaces de dominio para Lectores.
**Verificación:** tablas y llaves foráneas presentes en la base.

### ISS-04 — Autenticación (registro, login, hashing)
**Objetivo:** credenciales seguras.
**Pasos:**
1. Crear `UserModel` (`email`, `password_hash`, `rol`, `refresh_token_hash`).
2. Hashear con bcrypt (`BcryptPasswordHasherService`).
3. `AuthService.register()` / `login()` + `AuthController` (`POST /api/auth/registro`, `/login`).
**Verificación:** registro `201`, login `200` con `accessToken` y `refreshToken`.

### ISS-05 — JWT Bearer + Refresh + rotación
**Objetivo:** sesiones con access + refresh token.
**Pasos:**
1. `JwtAuthGuard` valida `Authorization: Bearer <token>`.
2. `AuthService.generateTokens()` firma access (`JWT_SECRET`) y refresh (`JWT_REFRESH_SECRET`).
3. `POST /api/auth/refresh` valida el refresh y **rota** el par (se guarda `sha256` del refresh).
**Verificación:** refresh válido `200`, refresh manipulado `403`.

### ISS-06 — RBAC y autenticación básica
**Objetivo:** autorización por roles y por credencial de servicio.
**Pasos:**
1. `RolesGuard` + decorador `@Roles(...)` (metadatos vía `Reflector`).
2. `BasicAuthGuard` valida la cabecera `x-api-key`.
**Verificación:** rol incorrecto → `403`; sin `x-api-key` → `401`.

### ISS-07 — 4 niveles de acceso en las 2 tablas de negocio
**Objetivo:** instrumentar `Lectores` y `Préstamos` con los 4 niveles.
**Pasos:**
1. Nivel 1 (público): `GET /api/lectores/publico`, `GET /api/prestamos/estadisticas-publicas`.
2. Nivel 2 (`x-api-key`): `GET /api/lectores/autenticado-basico`, `GET /api/prestamos/resumen-interno`.
3. Nivel 3 (JWT): `GET /api/lectores/jwt`, `GET /api/prestamos`.
4. Nivel 4 (JWT + RBAC): `POST /api/lectores` (ADMIN), `POST /api/prestamos` (ADMIN/BIBLIOTECARIO).
5. Documentar cada endpoint con `@ApiOperation`, `@ApiBearerAuth`, `@ApiHeader` y `@ApiResponse` (401/403/200/201).
**Verificación:** matriz de la sección **3**.

### ISS-08 — Pruebas HTTP, Swagger, integración y proceso
**Objetivo:** evidencia de pruebas y documentación.
**Pasos:**
1. Integrar `AuthModule`, `BusinessModule`, `HealthModule` en `app.module.ts`.
2. Crear `pruebas_accesos.http` con los 4 niveles (sección **5**).
3. Habilitar Swagger en `/api/docs` con esquemas `bearer` y `x-api-key` (sección **6**).
4. Redactar la matriz de pruebas en `proceso.md`.
**Verificación:** `npm run test:e2e` en verde.

---

## 3. Matriz de acceso en las 2 tablas de negocio

Se instrumentaron las dos tablas centrales de negocio: **`Lectores`** y **`Préstamos`**.

| Nivel | Mecanismo | Endpoint Lectores | Endpoint Préstamos |
| :--- | :--- | :--- | :--- |
| **1. Sin autenticación** | Libre | `GET /api/lectores/publico` | `GET /api/prestamos/estadisticas-publicas` |
| **2. Solo autenticación** | Cabecera `x-api-key` | `GET /api/lectores/autenticado-basico` | `GET /api/prestamos/resumen-interno` |
| **3. JWT + Refresh** | `Authorization: Bearer <token>` | `GET /api/lectores/jwt` | `GET /api/prestamos` |
| **4. JWT + Refresh + RBAC** | Bearer + rol | `POST /api/lectores` (ADMIN) | `POST /api/prestamos` (ADMIN, BIBLIOTECARIO) |

Credencial básica por defecto: `x-api-key: lectura-abierta-basic-key` (`BASIC_API_KEY` en `.env`).

---

## 4. Matriz de pruebas: exitosas vs fallidas

Todas las respuestas exitosas se envuelven con el `ResponseInterceptor`:

```json
{ "statusCode": 200, "message": "Operación realizada con éxito", "data": { }, "timestamp": "..." }
```

Y los errores con el `GlobalExceptionFilter`:

```json
{ "statusCode": 401, "message": "...", "timestamp": "...", "path": "/api/..." }
```

### Nivel 1 — Sin autenticación
* **Exitosa** `GET /api/lectores/publico` → `200 OK`, listado público.
* **Exitosa** `GET /api/prestamos/estadisticas-publicas` → `200 OK`, `totalPrestamosRegistrados`.

### Nivel 2 — Solo autenticación
* **Fallida** `GET /api/lectores/autenticado-basico` sin cabecera → `401`
  `{"statusCode":401,"message":"Acceso no autorizado: Se requiere cabecera x-api-key válida"}`
* **Exitosa** con `x-api-key` → `200 OK`.

### Nivel 3 — Autenticación + JWT + Refresh
* **Fallida** `GET /api/prestamos` sin header → `401` `{"message":"Token Bearer no proporcionado"}`
* **Fallida** token inválido/expirado → `401` `{"message":"Token inválido o expirado"}`
* **Exitosa** con Bearer → `200 OK`.
* **Exitosa** `POST /api/auth/refresh` con refresh válido → `200 OK`, nuevo par de tokens.
* **Fallida** `POST /api/auth/refresh` con token manipulado → `403` `{"message":"Refresh token expirado o inválido"}`

### Nivel 4 — Autenticación + JWT + Refresh + RBAC
* **Fallida** `POST /api/lectores` con rol `LECTOR` → `403`
  `{"statusCode":403,"message":"No cuenta con permisos suficientes para realizar esta acción"}`
* **Exitosa** `POST /api/lectores` con rol `ADMIN` → `201 Created`.
* **Fallida** `POST /api/prestamos` con rol `LECTOR` → `403`.
* **Exitosa** `POST /api/prestamos` con rol `BIBLIOTECARIO` → `201 Created`.

### Pruebas automatizadas (e2e)
`npm run test:e2e` ejecuta `test/app.e2e-spec.ts` y cubre los 4 niveles en ambas tablas (16 casos):

```
Test Files  1 passed (1)
     Tests  16 passed (16)
```

---

## 5. Pruebas con HTTP

Archivo listo para la extensión **REST Client** de VS Code: `pruebas_accesos.http`.

**Pasos:**
1. Levantar el servidor: `npm run start:dev` (puerto `4000`).
2. Abrir `pruebas_accesos.http` en VS Code con la extensión **REST Client**.
3. Ejecutar en orden los bloques `0 → 4` (el bloque 0 registra usuarios y guarda los tokens en variables `{{adminToken}}`, `{{lectorToken}}`, `{{adminRefreshToken}}`).
4. Observar el código de estado y el cuerpo de cada respuesta.

| Bloque | Petición | Resultado esperado |
| :--- | :--- | :--- |
| 0 | `POST /api/auth/registro` (ADMIN y LECTOR) | `201` |
| 0 | `POST /api/auth/login` | `200` con `accessToken`/`refreshToken` |
| 1 | `GET /api/lectores/publico` | `200` |
| 1 | `GET /api/prestamos/estadisticas-publicas` | `200` |
| 2 | `GET /api/lectores/autenticado-basico` (sin `x-api-key`) | `401` |
| 2 | `GET /api/lectores/autenticado-basico` (con `x-api-key`) | `200` |
| 3 | `GET /api/prestamos` (sin Bearer) | `401` |
| 3 | `GET /api/prestamos` (con Bearer) | `200` |
| 3 | `POST /api/auth/refresh` (válido / inválido) | `200` / `403` |
| 4 | `POST /api/lectores` (LECTOR / ADMIN) | `403` / `201` |

---

## 6. Pruebas con Swagger UI

La API expone la interfaz en **http://localhost:4000/api/docs**.

**Esquemas de seguridad configurados:**
- `bearer` (JWT) — botón **Authorize**.
- `x-api-key` (API Key en cabecera).

**Pasos:**
1. `npm run start:dev` y abrir `http://localhost:4000/api/docs`.
2. **Nivel 1:** ejecutar `GET /api/lectores/publico` → `200`.
3. **Nivel 2:** en `GET /api/lectores/autenticado-basico`, usar **Authorize** → `x-api-key` = `lectura-abierta-basic-key` → `200`. Sin la clave → `401`.
4. **Nivel 3:** ejecutar `POST /api/auth/login` con un usuario y copiar `accessToken`. Pulsar **Authorize** → pegar el token (solo el valor) → ejecutar `GET /api/prestamos` → `200`. Sin token → `401`.
5. **Nivel 4:** autenticado con token de rol `LECTOR`, ejecutar `POST /api/lectores` → `403`; con token `ADMIN` → `201`.
6. Cada operación muestra sus códigos documentados (`200`, `201`, `401`, `403`).
