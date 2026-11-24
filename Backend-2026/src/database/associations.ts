import { RoleUser } from "../features/auth/role-users/role-user.model";
import { ResourceRole } from "../features/auth/resource-roles/resource-role.model";
import { Resource } from "../features/auth/resources/resource.model";
import { Role } from "../features/auth/roles/role.model";
import { RefreshToken } from "../features/auth/session/refresh-token.model";
import { User } from "../features/auth/users/user.model";
import { Categoria } from "../features/business/categorias/categoria.model";
import { DetallePrestamo } from "../features/business/detalle-prestamos/detalle-prestamo.model";
import { Lector } from "../features/business/lectores/lector.model";
import { Libro } from "../features/business/libros/libro.model";
import { Prestamo } from "../features/business/prestamos/prestamo.model";

/**
 * Relaciones (las «R» de la guía). Se registran una sola vez, antes del `sync`.
 * FKs en snake_case; RESTRICT evita borrar padres con hijos.
 */
let registered = false;

export function registerAssociations(): void {
  if (registered) return;
  registered = true;

  const restrict = { onDelete: "RESTRICT", onUpdate: "CASCADE" } as const;

  // ── Negocio ──────────────────────────────────────────────────────
  Categoria.hasMany(Libro, { foreignKey: "categoria_id", as: "libros", ...restrict });
  Libro.belongsTo(Categoria, { foreignKey: "categoria_id", as: "categoria" });

  Lector.hasMany(Prestamo, { foreignKey: "lector_id", as: "prestamos", ...restrict });
  Prestamo.belongsTo(Lector, { foreignKey: "lector_id", as: "lector" });

  Prestamo.hasMany(DetallePrestamo, { foreignKey: "prestamo_id", as: "items", ...restrict });
  DetallePrestamo.belongsTo(Prestamo, { foreignKey: "prestamo_id", as: "prestamo" });

  Libro.hasMany(DetallePrestamo, { foreignKey: "libro_id", as: "detalles", ...restrict });
  DetallePrestamo.belongsTo(Libro, { foreignKey: "libro_id", as: "libro" });

  // ── Seguridad (RBAC) ─────────────────────────────────────────────
  User.hasMany(RoleUser, { foreignKey: "user_id", as: "roleUsers", ...restrict });
  RoleUser.belongsTo(User, { foreignKey: "user_id", as: "user" });

  Role.hasMany(RoleUser, { foreignKey: "role_id", as: "roleUsers", ...restrict });
  RoleUser.belongsTo(Role, { foreignKey: "role_id", as: "role" });

  Role.hasMany(ResourceRole, { foreignKey: "role_id", as: "grants", ...restrict });
  ResourceRole.belongsTo(Role, { foreignKey: "role_id", as: "role" });

  Resource.hasMany(ResourceRole, { foreignKey: "resource_id", as: "grants", ...restrict });
  ResourceRole.belongsTo(Resource, { foreignKey: "resource_id", as: "resource" });

  User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refreshTokens", onDelete: "CASCADE" });
  RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

registerAssociations();
