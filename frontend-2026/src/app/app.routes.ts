import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { authOnlyGuard } from './core/guards/auth-only-guard';
import { guestGuard } from './core/guards/guest-guard';
import { permissionGuard } from './core/guards/permission-guard';

/**
 * Rutas de la aplicación. Todas las pantallas se cargan con `loadComponent`
 * (chunks diferidos). `/construir` y `/login` quedan fuera del Shell protegido.
 */
export const routes: Routes = [
  {
    path: 'construir',
    title: 'Prototipo · LecturaAbierta',
    loadComponent: () => import('./features/construir/construir').then((m) => m.Construir),
  },
  {
    path: 'login',
    title: 'Iniciar sesión · LecturaAbierta',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Panel · LecturaAbierta',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/prestamos' },
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'lectores',
        title: 'Lectores · LecturaAbierta',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/lectores' },
        loadComponent: () =>
          import('./features/business/lectores/lector-list/lector-list').then((m) => m.LectorList),
      },
      {
        path: 'categorias',
        title: 'Categorías · LecturaAbierta',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/categorias' },
        loadComponent: () =>
          import('./features/business/categorias/categoria-list/categoria-list').then(
            (m) => m.CategoriaList,
          ),
      },
      {
        path: 'libros',
        title: 'Libros · LecturaAbierta',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/libros' },
        loadComponent: () =>
          import('./features/business/libros/libro-list/libro-list').then((m) => m.LibroList),
      },
      {
        path: 'prestamos',
        title: 'Préstamos · LecturaAbierta',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/prestamos' },
        loadComponent: () =>
          import('./features/business/prestamos/prestamo-list/prestamo-list').then(
            (m) => m.PrestamoList,
          ),
      },
      {
        path: 'prestamos/nuevo',
        title: 'Nuevo préstamo · LecturaAbierta',
        canActivate: [permissionGuard],
        data: { permission: 'POST /api/prestamos' },
        loadComponent: () =>
          import('./features/business/prestamos/prestamo-form/prestamo-form').then(
            (m) => m.PrestamoForm,
          ),
      },
      {
        path: 'detalle-prestamos',
        title: 'Detalle de préstamos · LecturaAbierta',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/detalle-prestamos' },
        loadComponent: () =>
          import('./features/business/detalle-prestamos/detalle-prestamo-list/detalle-prestamo-list').then(
            (m) => m.DetallePrestamoList,
          ),
      },
      {
        path: 'perfil',
        title: 'Mi sesión · LecturaAbierta',
        canActivate: [authOnlyGuard],
        loadComponent: () => import('./features/auth/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'forbidden',
        title: 'Acceso denegado · LecturaAbierta',
        loadComponent: () => import('./features/auth/forbidden/forbidden').then((m) => m.Forbidden),
      },
      {
        path: 'admin/usuarios',
        title: 'Usuarios · LecturaAbierta',
        canActivate: [authOnlyGuard, permissionGuard],
        data: { permission: 'GET /api/usuarios' },
        loadComponent: () =>
          import('./features/admin/users/user-list/user-list').then((m) => m.UserList),
      },
      {
        path: 'admin/roles',
        title: 'Roles · LecturaAbierta',
        canActivate: [authOnlyGuard, permissionGuard],
        data: { permission: 'GET /api/roles' },
        loadComponent: () =>
          import('./features/admin/roles/role-list/role-list').then((m) => m.RoleList),
      },
      {
        path: 'admin/recursos',
        title: 'Recursos · LecturaAbierta',
        canActivate: [authOnlyGuard, permissionGuard],
        data: { permission: 'GET /api/recursos' },
        loadComponent: () =>
          import('./features/admin/resources/resource-list/resource-list').then(
            (m) => m.ResourceList,
          ),
      },
      {
        path: 'admin/asignaciones',
        title: 'Asignaciones · LecturaAbierta',
        canActivate: [authOnlyGuard, permissionGuard],
        data: { permission: 'GET /api/asignaciones-rol' },
        loadComponent: () =>
          import('./features/admin/role-users/role-user-list/role-user-list').then(
            (m) => m.RoleUserList,
          ),
      },
      {
        path: 'admin/permisos',
        title: 'Concesiones · LecturaAbierta',
        canActivate: [authOnlyGuard, permissionGuard],
        data: { permission: 'GET /api/concesiones-rol' },
        loadComponent: () =>
          import('./features/admin/resource-roles/resource-role-list/resource-role-list').then(
            (m) => m.ResourceRoleList,
          ),
      },
      {
        path: 'crud',
        title: 'Usuarios y roles · LecturaAbierta',
        canActivate: [authOnlyGuard, permissionGuard],
        data: { permission: 'GET /api/asignaciones-rol' },
        loadComponent: () => import('./crud/user-role-crud').then((m) => m.UserRoleCrud),
      },
      {
        path: 'crud/permisos',
        title: 'Roles y permisos · LecturaAbierta',
        canActivate: [authOnlyGuard, permissionGuard],
        data: { permission: 'GET /api/concesiones-rol' },
        loadComponent: () => import('./crud/role-permissions').then((m) => m.RolePermissions),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
