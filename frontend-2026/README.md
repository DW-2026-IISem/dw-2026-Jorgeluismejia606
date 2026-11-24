# LecturaAbierta — Frontend (Angular 22)

Frontend de la Red de Bibliotecas **LecturaAbierta**, construido siguiendo la guía
*Frontend 2026* (ISS-01 → ISS-11): Angular 22 standalone + zoneless + signals,
PrimeNG 22 (tema Aura) y Tailwind CSS 4. Consume la API de `../Backend-2026`.

## Entidades unidas con el backend

Las entidades de negocio viven en la misma ruta relativa y con el mismo nombre de
archivo de modelo en los dos proyectos:

| Backend (`Backend-2026/src/features/business/`) | Frontend (`src/app/features/business/`) |
|---|---|
| `lectores/lector.model.ts` | `lectores/lector.model.ts` + `lector-api.ts`, `lector-form/`, `lector-list/` |
| `categorias/categoria.model.ts` | `categorias/categoria.model.ts` + `categoria-api.ts`, `categoria-form/`, `categoria-list/` |
| `libros/libro.model.ts` | `libros/libro.model.ts` + `libro-api.ts`, `libro-form/`, `libro-list/` |
| `prestamos/prestamo.model.ts` | `prestamos/prestamo.model.ts` + `prestamo-api.ts`, `prestamo-form/`, `prestamo-list/`, `prestamo-detail/` |
| `detalle-prestamos/detalle-prestamo.model.ts` | `detalle-prestamos/detalle-prestamo.model.ts` + `detalle-prestamo-api.ts`, `detalle-prestamo-form/`, `detalle-prestamo-list/` |

Los campos de cada interfaz del frontend coinciden con la interfaz `…I` del backend
(salvo `password`, que la API nunca devuelve). Si agregas un campo en el backend,
agrégalo en el `*.model.ts` de la misma carpeta del frontend.

Los tipos transversales (`api.model.ts`) y los de seguridad (usuarios, roles,
recursos, asignaciones, concesiones, sesión) siguen en `src/app/core/models/`.

## Equivalencias con la guía

| Guía (storelab) | LecturaAbierta | Ruta UI | API |
|---|---|---|---|
| clientes | lectores | `/lectores` | `/api/lectores` → `{ lectores }` |
| tipos de producto | categorías | `/categorias` | `/api/categorias` → `{ categorias }` |
| productos | libros (`cantidad` = ejemplares) | `/libros` | `/api/libros` → `{ libros }` |
| ventas | préstamos | `/prestamos`, `/prestamos/nuevo` | `/api/prestamos` → `{ prestamos }` |
| detalle de ventas | detalle de préstamos | `/detalle-prestamos` | `/api/detalle-prestamos` → `{ detalle_prestamos }` |
| SELLER / seller | BIBLIOTECARIO / bibliotecario | — | — |

Administración RBAC (`/admin/usuarios`, `/admin/roles`, `/admin/recursos`,
`/admin/asignaciones`, `/admin/permisos`), `/login`, `/perfil`, `/forbidden` y el
prototipo `/construir` siguen la guía.

## Uso

```bash
# desde la raíz del workspace
npm install
npm run dev            # backend :4000 + frontend :4200 (concurrently)

# solo el frontend
cd frontend-2026
npm start              # http://localhost:4200
npm run build          # dist/frontend-2026
npm test -- --watch=false
```

Credenciales: `admin / Admin123!` (68 permisos) · `bibliotecario / Biblio123!` (7 permisos).

- `src/environments/*.ts`: `apiUrl` (sin `/` final), `requireAuth` (se empareja con
  `AUTH_ENABLED` del backend) y `primeUiLicense` (clave Community de PrimeUI; vacía
  = solo aparece el aviso de licencia).
- Modo laboratorio (Fase I): `requireAuth: false` aquí **y** `AUTH_ENABLED=false` en el
  backend; luego `localStorage.removeItem('lecturaabierta.session.v1')`.

## Diferencias deliberadas con la guía

1. Como el backend corrigió el catálogo RBAC (68 recursos), Préstamos y Detalle de
   préstamos muestran cancelar/editar/eliminar al ADMIN (protegidos con `*appHasPermission`).
2. El semáforo de stock usa `stock_minimo` tanto en la lista de libros como en el panel
   (la guía dejaba el panel con un umbral fijo de 5).
3. El panel consulta `GET /api/categorias` (la guía consolidada usaba un permiso con una
   ruta que no existe en el catálogo).
4. Todas las pantallas del CRUD están completas (lista + formulario + bajas), no solo el
   listado.
