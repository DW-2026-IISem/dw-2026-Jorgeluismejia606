/**
 * Catálogo del menú lateral. El Shell lo filtra con `SessionStore.canPermission()`
 * y oculta los grupos `authOnly` cuando la autenticación está desactivada.
 * Crear un Resource en el backend no crea una pantalla: solo habilita una de estas.
 */
export interface NavItem {
  label: string;
  icon: string;
  routerLink: string;
  /** Permiso necesario para ver la opción (`MÉTODO /api/...`). */
  permission?: string;
}

export interface NavGroup {
  label: string;
  /** Solo existe con sesión (perfil y administración RBAC). */
  authOnly?: boolean;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: 'Operación',
    items: [
      {
        label: 'Panel',
        icon: 'pi pi-chart-bar',
        routerLink: '/dashboard',
        permission: 'GET /api/prestamos',
      },
      {
        label: 'Lectores',
        icon: 'pi pi-users',
        routerLink: '/lectores',
        permission: 'GET /api/lectores',
      },
      {
        label: 'Categorías',
        icon: 'pi pi-tags',
        routerLink: '/categorias',
        permission: 'GET /api/categorias',
      },
      { label: 'Libros', icon: 'pi pi-book', routerLink: '/libros', permission: 'GET /api/libros' },
      {
        label: 'Préstamos',
        icon: 'pi pi-arrow-right-arrow-left',
        routerLink: '/prestamos',
        permission: 'GET /api/prestamos',
      },
      {
        label: 'Nuevo préstamo',
        icon: 'pi pi-plus-circle',
        routerLink: '/prestamos/nuevo',
        permission: 'POST /api/prestamos',
      },
      {
        label: 'Detalle de préstamos',
        icon: 'pi pi-list',
        routerLink: '/detalle-prestamos',
        permission: 'GET /api/detalle-prestamos',
      },
    ],
  },
  {
    label: 'Seguridad',
    authOnly: true,
    items: [
      {
        label: 'Usuarios',
        icon: 'pi pi-user',
        routerLink: '/admin/usuarios',
        permission: 'GET /api/usuarios',
      },
      {
        label: 'Roles',
        icon: 'pi pi-id-card',
        routerLink: '/admin/roles',
        permission: 'GET /api/roles',
      },
      {
        label: 'Recursos',
        icon: 'pi pi-sitemap',
        routerLink: '/admin/recursos',
        permission: 'GET /api/recursos',
      },
      {
        label: 'Asignaciones',
        icon: 'pi pi-link',
        routerLink: '/admin/asignaciones',
        permission: 'GET /api/asignaciones-rol',
      },
      {
        label: 'Concesiones',
        icon: 'pi pi-key',
        routerLink: '/admin/permisos',
        permission: 'GET /api/concesiones-rol',
      },
      {
        label: 'Usuarios y roles',
        icon: 'pi pi-user-edit',
        routerLink: '/crud',
        permission: 'GET /api/asignaciones-rol',
      },
      {
        label: 'Roles y permisos',
        icon: 'pi pi-lock',
        routerLink: '/crud/permisos',
        permission: 'GET /api/concesiones-rol',
      },
      { label: 'Mi sesión', icon: 'pi pi-shield', routerLink: '/perfil' },
    ],
  },
  {
    label: 'Aprendizaje',
    items: [{ label: 'Prototipo', icon: 'pi pi-desktop', routerLink: '/construir' }],
  },
];
