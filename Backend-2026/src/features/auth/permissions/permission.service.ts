import { RoleUser } from "../role-users/role-user.model";
import { ResourceRole } from "../resource-roles/resource-role.model";
import { HttpMethod, Resource } from "../resources/resource.model";
import { Role } from "../roles/role.model";

/** Una fila de role_users → roles → resource_roles → resources (todo activo). */
export interface EffectivePermission {
  resource_id: number;
  method: HttpMethod;
  path: string;
  description: string | null;
  role_id: number;
  role_name: string;
}

type Assignment = RoleUser & {
  role: Role & { grants: Array<ResourceRole & { resource: Resource }> };
};

/**
 * Permisos efectivos de un usuario. Es la MISMA consulta que usa `authorize`,
 * así lo que ve el frontend en `/api/permisos` coincide con lo que se valida.
 */
export async function getEffectivePermissions(userId: number): Promise<EffectivePermission[]> {
  const assignments = (await RoleUser.findAll({
    where: { user_id: userId, status: "active" },
    include: [
      {
        model: Role,
        as: "role",
        required: true,
        where: { status: "active" },
        include: [
          {
            model: ResourceRole,
            as: "grants",
            required: true,
            where: { status: "active" },
            include: [{ model: Resource, as: "resource", required: true, where: { status: "active" } }],
          },
        ],
      },
    ],
  })) as Assignment[];

  const seen = new Set<string>();
  const permissions: EffectivePermission[] = [];
  for (const assignment of assignments) {
    for (const grant of assignment.role.grants) {
      const key = `${grant.resource.id}:${assignment.role.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      permissions.push({
        resource_id: grant.resource.id,
        method: grant.resource.method,
        path: grant.resource.path,
        description: grant.resource.description,
        role_id: assignment.role.id,
        role_name: assignment.role.name,
      });
    }
  }
  return permissions.sort((a, b) => a.resource_id - b.resource_id || a.role_id - b.role_id);
}

export async function hasPermission(userId: number, method: string, path: string): Promise<boolean> {
  const permissions = await getEffectivePermissions(userId);
  return permissions.some((p) => p.method === method.toUpperCase() && p.path === path);
}
