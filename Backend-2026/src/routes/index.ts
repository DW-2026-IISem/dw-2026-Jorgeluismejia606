import { RoleUserRoutes } from "../features/auth/role-users/role-user.routes";
import { ResourceRoleRoutes } from "../features/auth/resource-roles/resource-role.routes";
import { ResourceRoutes } from "../features/auth/resources/resource.routes";
import { RoleRoutes } from "../features/auth/roles/role.routes";
import { SessionRoutes } from "../features/auth/session/session.routes";
import { UserRoutes } from "../features/auth/users/user.routes";
import { CategoriaRoutes } from "../features/business/categorias/categoria.routes";
import { DetallePrestamoRoutes } from "../features/business/detalle-prestamos/detalle-prestamo.routes";
import { LectorRoutes } from "../features/business/lectores/lector.routes";
import { LibroRoutes } from "../features/business/libros/libro.routes";
import { PrestamoRoutes } from "../features/business/prestamos/prestamo.routes";
import { HealthRoutes } from "../features/health/health.routes";

/** Agregador de features (patrón de la guía §4.3). */
export class Routes {
  // Infra
  public healthRoutes: HealthRoutes = new HealthRoutes();
  // Negocio
  public lectorRoutes: LectorRoutes = new LectorRoutes();
  public categoriaRoutes: CategoriaRoutes = new CategoriaRoutes();
  public libroRoutes: LibroRoutes = new LibroRoutes();
  public prestamoRoutes: PrestamoRoutes = new PrestamoRoutes();
  public detallePrestamoRoutes: DetallePrestamoRoutes = new DetallePrestamoRoutes();
  // Seguridad
  public sessionRoutes: SessionRoutes = new SessionRoutes();
  public userRoutes: UserRoutes = new UserRoutes();
  public roleRoutes: RoleRoutes = new RoleRoutes();
  public resourceRoutes: ResourceRoutes = new ResourceRoutes();
  public roleUserRoutes: RoleUserRoutes = new RoleUserRoutes();
  public resourceRoleRoutes: ResourceRoleRoutes = new ResourceRoleRoutes();
}
