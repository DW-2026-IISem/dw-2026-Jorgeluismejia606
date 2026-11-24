import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { Resource } from '../core/models/resource.model';
import { ResourceRole } from '../core/models/resource-role.model';
import { Role } from '../core/models/role.model';
import { AuthService } from '../core/services/auth';
import { NotificationService } from '../core/services/notification';
import { toApiMessage } from '../core/utils/api-error';
import { ResourceApi } from '../features/admin/resources/resource-api';
import { RoleApi } from '../features/admin/roles/role-api';
import { ResourceRoleApi } from '../features/admin/resource-roles/resource-role-api';

type Op = 'C' | 'R' | 'U' | 'D';
const OPS: Op[] = ['C', 'R', 'U', 'D'];
const OP_BY_METHOD: Record<string, Op> = {
  POST: 'C',
  GET: 'R',
  PUT: 'U',
  PATCH: 'U',
  DELETE: 'D',
};

interface Cell {
  ids: number[];
  state: 'na' | 'none' | 'some' | 'all';
}

interface EntityRow {
  key: string;
  label: string;
  cells: Record<Op, Cell>;
}

/** '/api/detalle-prestamos/:id' → 'detalle-prestamos' */
function entityOf(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[0] === 'api' ? (parts[1] ?? '') : (parts[0] ?? '');
}

/** 'detalle-prestamos' → 'Detalle prestamos' */
function labelOf(key: string): string {
  const text = key.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Roles y permisos: matriz rol × entidad con Crear / Leer / Actualizar / Eliminar.
 * Cada casilla agrupa los recursos (method + path) de esa entidad y operación.
 * Guardar concede (POST /api/concesiones-rol) o retira (PATCH .../deactivate)
 * solo lo que cambió respecto a lo que el rol ya tenía.
 */
@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule],
  templateUrl: './role-permissions.html',
  styleUrl: './role-permissions.css',
})
export class RolePermissions {
  private readonly roleApi = inject(RoleApi);
  private readonly resourceApi = inject(ResourceApi);
  private readonly grantApi = inject(ResourceRoleApi);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);

  protected readonly ops = OPS;

  readonly roles = signal<Role[]>([]);
  readonly resources = signal<Resource[]>([]);
  readonly grants = signal<ResourceRole[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly roleId = signal<number | null>(null);
  /** Recursos marcados en pantalla (aún sin guardar). */
  readonly desired = signal<Set<number>>(new Set());

  readonly currentRole = computed(() => this.roles().find((r) => r.id === this.roleId()) ?? null);

  /** Recursos activos agrupados por entidad y operación. */
  private readonly groups = computed(() => {
    const map = new Map<string, Record<Op, number[]>>();
    for (const r of this.resources()) {
      if (r.status !== 'active') continue;
      const key = entityOf(r.path);
      const op = OP_BY_METHOD[r.method];
      if (!key || !op) continue;
      if (!map.has(key)) map.set(key, { C: [], R: [], U: [], D: [] });
      map.get(key)![op].push(r.id);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, ops]) => ({ key, label: labelOf(key), ops }));
  });

  readonly rows = computed<EntityRow[]>(() => {
    const desired = this.desired();
    return this.groups().map((g) => {
      const cells = {} as Record<Op, Cell>;
      for (const op of OPS) {
        const ids = g.ops[op];
        const marked = ids.filter((id) => desired.has(id)).length;
        cells[op] = {
          ids,
          state:
            ids.length === 0 ? 'na' : marked === 0 ? 'none' : marked === ids.length ? 'all' : 'some',
        };
      }
      return { key: g.key, label: g.label, cells };
    });
  });

  /** ¿Hay cambios sin guardar? */
  readonly dirty = computed(() => {
    const id = this.roleId();
    if (id === null) return false;
    const current = this.activeIdsFor(id);
    const desired = this.desired();
    if (current.size !== desired.size) return true;
    for (const rid of desired) if (!current.has(rid)) return true;
    return false;
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      roles: this.roleApi.list(),
      resources: this.resourceApi.list(),
      grants: this.grantApi.list(),
    }).subscribe({
      next: ({ roles, resources, grants }) => {
        this.roles.set(roles.filter((r) => r.status === 'active'));
        this.resources.set(resources);
        this.grants.set(grants);
        const id = this.roleId() ?? this.roles()[0]?.id ?? null;
        this.roleId.set(id);
        this.desired.set(id === null ? new Set() : this.activeIdsFor(id));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toApiMessage(err));
        this.loading.set(false);
      },
    });
  }

  selectRole(id: number | null): void {
    this.roleId.set(id);
    this.desired.set(id === null ? new Set() : this.activeIdsFor(id));
  }

  toggle(cell: Cell): void {
    if (cell.state === 'na' || this.roleId() === null) return;
    const next = new Set(this.desired());
    if (cell.state === 'all') {
      cell.ids.forEach((id) => next.delete(id));
    } else {
      cell.ids.forEach((id) => next.add(id));
    }
    this.desired.set(next);
  }

  markAll(): void {
    const all = new Set<number>();
    for (const g of this.groups()) for (const op of OPS) g.ops[op].forEach((id) => all.add(id));
    this.desired.set(all);
  }

  unmarkAll(): void {
    this.desired.set(new Set());
  }

  save(): void {
    const roleId = this.roleId();
    if (roleId === null) return;

    const current = this.activeIdsFor(roleId);
    const desired = this.desired();
    const requests: Observable<unknown>[] = [];

    // Conceder lo nuevo (reactivando si la pareja ya existía inactiva).
    for (const resourceId of desired) {
      if (current.has(resourceId)) continue;
      const inactive = this.grants().find(
        (g) => g.role_id === roleId && g.resource_id === resourceId && g.status !== 'active',
      );
      requests.push(
        inactive
          ? this.grantApi.reactivate(inactive.id)
          : this.grantApi.create({ role_id: roleId, resource_id: resourceId }),
      );
    }

    // Retirar lo desmarcado.
    for (const g of this.grants()) {
      if (g.role_id === roleId && g.status === 'active' && !desired.has(g.resource_id)) {
        requests.push(this.grantApi.deactivate(g.id));
      }
    }

    if (requests.length === 0) return;

    this.saving.set(true);
    forkJoin(requests).subscribe({
      next: () => {
        this.saving.set(false);
        this.notify.success('Permisos guardados', `${requests.length} cambio(s) aplicados`);
        this.load();
        this.auth.me().subscribe({ error: () => undefined });
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudieron guardar los permisos', toApiMessage(err));
        this.load();
      },
    });
  }

  private activeIdsFor(roleId: number): Set<number> {
    return new Set(
      this.grants()
        .filter((g) => g.role_id === roleId && g.status === 'active')
        .map((g) => g.resource_id),
    );
  }
}
