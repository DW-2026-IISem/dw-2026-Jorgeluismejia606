import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { UserApi } from '../features/admin/users/user-api';
import { RoleApi } from '../features/admin/roles/role-api';
import { RoleUserApi } from '../features/admin/role-users/role-user-api';
import { User } from '../core/models/user.model';
import { Role } from '../core/models/role.model';
import { RoleUser } from '../core/models/role-user.model';

interface UserRow {
  user: User;
  assigned: RoleUser[];
  available: Role[];
}

/**
 * CRUD de usuarios y roles.
 * Lista los usuarios con sus roles activos y permite:
 *  - asignar un rol  → POST  /api/asignaciones-rol
 *  - retirar un rol  → PATCH /api/asignaciones-rol/:id/deactivate
 */
@Component({
  selector: 'app-user-role-crud',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, TableModule, TagModule],
  templateUrl: './user-role-crud.html',
  styleUrl: './user-role-crud.css',
})
export class UserRoleCrud implements OnInit {
  private readonly userApi = inject(UserApi);
  private readonly roleApi = inject(RoleApi);
  private readonly roleUserApi = inject(RoleUserApi);

  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly assignments = signal<RoleUser[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Rol elegido en el selector de cada usuario: { [userId]: roleId }. */
  readonly selected = signal<Record<number, number | null>>({});

  /** Una fila por usuario: sus roles activos y los que aún puede recibir. */
  readonly rows = computed<UserRow[]>(() => {
    const activeRoles = this.roles().filter((r) => r.status === 'active');
    return this.users().map((user) => {
      const assigned = this.assignments().filter(
        (a) => a.user_id === user.id && a.status === 'active',
      );
      const assignedIds = new Set(assigned.map((a) => a.role_id));
      return {
        user,
        assigned,
        available: activeRoles.filter((r) => !assignedIds.has(r.id)),
      };
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      users: this.userApi.list(),
      roles: this.roleApi.list(),
      assignments: this.roleUserApi.list(),
    }).subscribe({
      next: ({ users, roles, assignments }) => {
        this.users.set(users);
        this.roles.set(roles);
        this.assignments.set(assignments);
        this.selected.set({});
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios y roles.');
        this.loading.set(false);
      },
    });
  }

  select(userId: number, roleId: number | null): void {
    this.selected.update((s) => ({ ...s, [userId]: roleId }));
  }

  assign(userId: number): void {
    const roleId = this.selected()[userId];
    if (!roleId) return;
    this.roleUserApi.create({ user_id: userId, role_id: roleId }).subscribe({
      next: () => this.load(),
      error: () => this.error.set('No se pudo asignar el rol.'),
    });
  }

  remove(assignment: RoleUser): void {
    this.roleUserApi.deactivate(assignment.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('No se pudo retirar el rol.'),
    });
  }

  roleName(a: RoleUser): string {
    return a.role?.name ?? this.roles().find((r) => r.id === a.role_id)?.name ?? `Rol ${a.role_id}`;
  }
}
