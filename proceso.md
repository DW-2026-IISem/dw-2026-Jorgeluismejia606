# Bitácora de Implementación y Matriz de Pruebas - LecturaAbierta API

**Stack Base:** Express / NestJS + TypeScript + Sequelize + SQLite  
**Puerto de Operación:** 4000  
**Ruta Swagger UI:** http://localhost:4000/api/docs  

---

## 1. Bitácora de Commits por Cada ISS

| ISS | Commit Hash | Mensaje de Confirmación | Componentes Principales |
| :--- | :---: | :--- | :--- |
| **ISS-01** | `origin` | `feat(core): ISS-01 configuracion de entorno base, validaciones y bootstrapping` | `.env`, `main.ts`, `env.validation.ts` |
| **ISS-02** | `45e417f` | `feat(database): ISS-02 integracion de Sequelize con dialecto SQLite y registro centralizado de modelos` | `sequelize.module.ts`, `sequelize.options.ts` |
| **ISS-03** | `origin` | `feat(business): ISS-03 definicion de entidades, esquemas relacionales y repositorios base` | `features/business/*` |
| **ISS-04** | `0758daa` | `feat(auth): ISS-04 modulo de autenticacion con registro, login seguro y hashing de credenciales` | `user.model.ts`, `auth.service.ts`, `auth.controller.ts` |
| **ISS-05** | `875370f` | `feat(auth): ISS-05 implementacion de JWT Bearer, endpoint de refresco y rotacion de refresh tokens` | `jwt-auth.guard.ts`, `refresh-token.dto.ts` |
| **ISS-06** | `bf3c85a` | `feat(security): ISS-06 guardias de autorizacion RBAC por roles y autenticacion basica` | `roles.guard.ts`, `basic-auth.guard.ts` |
| **ISS-07** | `6318230` | `feat(security): ISS-07 aplicacion de los 4 niveles de acceso (publico, basic, jwt, rbac) en lectores y prestamos` | `lectores.controller.ts`, `prestamos.controller.ts` |
| **ISS-08** | `afb5500` | `docs: ISS-08 adicion de pruebas http, integracion de app.module y proceso.md` | `proceso.md`, `pruebas_accesos.http`, `app.module.ts` |

---

## 2. Matriz de Acceso en las 2 Tablas de Business

Se instrumentaron las dos tablas centrales de negocio: **`Lectores`** y **`Préstamos`**.

| Nivel de Acceso | Endpoint Lectores | Endpoint Préstamos | Tipo de Mecanismo |
| :--- | :--- | :--- | :--- |
| **1. Sin Autenticación** | `GET /api/lectores/publico` | `GET /api/prestamos/estadisticas-publicas` | Libre acceso sin cabeceras |
| **2. Solo Autenticación** | `GET /api/lectores/autenticado-basico` | `GET /api/prestamos/resumen-interno` | Cabecera `x-api-key: lectura-abierta-basic-key` |
| **3. JWT + Refresh** | `GET /api/lectores/jwt` | `GET /api/prestamos` | Token Bearer (`Authorization: Bearer <token>`) |
| **4. JWT + Refresh + RBAC** | `POST /api/lectores` | `POST /api/prestamos` | Token Bearer validando rol de usuario (`ADMIN`) |

---

## 3. Matriz de Pruebas: Exitosas vs Fallidas

### Nivel 1: Sin Autenticación
* **Prueba Exitosa (`GET /api/lectores/publico`):**
  * HTTP `200 OK`
  * Retorna listado de lectores sin requerir ninguna cabecera.
* **Prueba Exitosa (`GET /api/prestamos/estadisticas-publicas`):**
  * HTTP `200 OK`
  * Retorna métricas numéricas del total de préstamos.

### Nivel 2: Solo Autenticación
* **Prueba Fallida (`GET /api/lectores/autenticado-basico` sin cabecera):**
  * HTTP `401 Unauthorized`
  * Respuesta: `{"statusCode": 401, "message": "Acceso no autorizado: Se requiere cabecera x-api-key válida"}`
* **Prueba Exitosa (`GET /api/lectores/autenticado-basico` con `x-api-key`):**
  * HTTP `200 OK`
  * Acceso concedido al verificar la credencial de servicio.

### Nivel 3: Autenticación + JWT Token + Refresh Token
* **Prueba Fallida (`GET /api/prestamos` sin Authorization header):**
  * HTTP `401 Unauthorized`
  * Respuesta: `{"statusCode": 401, "message": "Token Bearer no proporcionado"}`
* **Prueba Exitosa (`GET /api/prestamos` con Bearer Token):**
  * HTTP `200 OK`
  * Listado completo de préstamos recuperado.
* **Rotación Exitosa de Token (`POST /api/auth/refresh` con `refreshToken` válido):**
  * HTTP `200 OK`
  * Emite nuevo par `accessToken` y `refreshToken`.
* **Rotación Fallida de Token (`POST /api/auth/refresh` con token manipulado):**
  * HTTP `403 Forbidden`
  * Respuesta: `{"statusCode": 403, "message": "Refresh token expirado o inválido"}`

### Nivel 4: Autenticación + JWT + Refresh + RBAC
* **Prueba Fallida (`POST /api/lectores` con token de rol `LECTOR`):**
  * HTTP `403 Forbidden`
  * Respuesta: `{"statusCode": 403, "message": "No cuenta con permisos suficientes para realizar esta acción"}`
* **Prueba Exitosa (`POST /api/lectores` con token de rol `ADMIN`):**
  * HTTP `201 Created`
  * Lector creado satisfactoriamente en base de datos.

---

## 4. Pruebas Interactivas con Swagger UI

La API expone la interfaz Swagger en `http://localhost:4000/api/docs`:
1. El botón **Authorize** permite inyectar el Bearer Token obtenido tras login.
2. Cada endpoint de Nivel 2 detalla el parámetro de cabecera `x-api-key`.
