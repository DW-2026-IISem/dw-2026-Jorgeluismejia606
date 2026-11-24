import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Role } from '../../../../core/models/role.model';
import { RoleUser } from '../../../../core/models/role-user.model';
import { User } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification';
import { SessionStore } from '../../../../core/services/session-store';
import { toApiMessage } from '../../../../core/utils/api-error';
import { HasPermission } from '../../../../shared/directives/has-permission';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { RoleApi } from '../../roles/role-api';
import { UserApi } from '../../users/user-api';
import { RoleUserApi } from '../role-user-api';

/**
 * Asignaciones usuario ↔ rol (primer eslabón de la cadena RBAC). Retirar es
 * baja lógica; no hay DELETE físico (auditoría).
 */
@Component({
  host: { class: 'block' },
  selector: 'app-role-user-list',
  imports: [
    AvatarModule,
    ButtonModule,
    DatePipe,
    DialogModule,
    EmptyState,
    FormsModule,
    HasPermission,
    MessageModule,
    PageHeader,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './role-user-list.html',
  styleUrl: './role-user-list.css',
})
export class RoleUserList {
  private readonly api = inject(RoleUserApi);
  private readonly usersApi = inject(UserApi);
  private readonly rolesApi = inject(RoleApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<RoleUser[]>([]);
  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly userFilter = signal<User | null>(null);
  readonly roleFilter = signal<Role | null>(null);
  readonly visibleRows = computed(() => {
    const user = this.userFilter();
    const role = this.roleFilter();
    return this.rows().filter(
      (row) => (!user || row.user_id === user.id) && (!role || row.role_id === role.id),
    );
  });

  readonly dialogVisible = signal(false);
  readonly selectedUser = signal<User | null>(null);
  readonly selectedRole = signal<Role | null>(null);
  readonly canSave = computed(
    () => !!this.selectedUser() && !!this.selectedRole() && !this.saving(),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      rows: this.api.list(),
      users: this.session.canPermission('GET /api/usuarios')
        ? this.usersApi.list()
        : of<User[]>([]),
      roles: this.session.canPermission('GET /api/roles') ? this.rolesApi.list() : of<Role[]>([]),
    }).subscribe({
      next: ({ rows, users, roles }) => {
        this.rows.set(rows);
        this.users.set(users);
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  initials(username: string | undefined): string {
    return (username ?? '?').slice(0, 2).toUpperCase();
  }

  openAssign(): void {
    this.selectedUser.set(null);
    this.selectedRole.set(null);
    this.dialogVisible.set(true);
  }

  assign(): void {
    const user = this.selectedUser();
    const role = this.selectedRole();
    if (!user || !role) {
      return;
    }
    this.saving.set(true);
    this.api.create({ user_id: user.id, role_id: role.id }).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success('Rol asignado', `${role.name} → ${user.username}`);
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo asignar', toApiMessage(error));
      },
    });
  }

  retire(row: RoleUser): void {
    this.confirmation.confirm({
      header: 'Retirar rol',
      message: `¿Retirar ${row.role?.name ?? 'el rol'} a ${row.user?.username ?? 'este usuario'}? Pierde esos permisos de inmediato.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () =>
        this.api.deactivate(row.id).subscribe({
          next: () => {
            this.notify.warn('Rol retirado');
            this.load();
          },
          error: (error: unknown) => this.notify.error('No se pudo retirar', toApiMessage(error)),
        }),
    });
  }
}
