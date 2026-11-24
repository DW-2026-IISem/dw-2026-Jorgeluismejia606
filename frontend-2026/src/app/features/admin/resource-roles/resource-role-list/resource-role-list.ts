import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Resource } from '../../../../core/models/resource.model';
import { ResourceRole } from '../../../../core/models/resource-role.model';
import { Role } from '../../../../core/models/role.model';
import { AuthService } from '../../../../core/services/auth';
import { NotificationService } from '../../../../core/services/notification';
import { SessionStore } from '../../../../core/services/session-store';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { methodSeverity } from '../../../../core/utils/http-method';
import { HasPermission } from '../../../../shared/directives/has-permission';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { ResourceApi } from '../../resources/resource-api';
import { RoleApi } from '../../roles/role-api';
import { ResourceRoleApi } from '../resource-role-api';

/**
 * Concesiones rol ↔ recurso: **cada fila es un permiso**. Conceder o retirar no
 * requiere desplegar código; la siguiente petición ya consulta la nueva matriz.
 */
@Component({
  host: { class: 'block' },
  selector: 'app-resource-role-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    FormsModule,
    HasPermission,
    InputTextModule,
    MessageModule,
    PageHeader,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './resource-role-list.html',
  styleUrl: './resource-role-list.css',
})
export class ResourceRoleList {
  private readonly api = inject(ResourceRoleApi);
  private readonly rolesApi = inject(RoleApi);
  private readonly resourcesApi = inject(ResourceApi);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<ResourceRole[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly resources = signal<Resource[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly roleFilter = signal<Role | null>(null);
  readonly filter = signal('');
  readonly visibleRows = computed(() => {
    const role = this.roleFilter();
    const byRole = role ? this.rows().filter((row) => row.role_id === role.id) : this.rows();
    return filterRows(byRole, this.filter(), (row) => [
      row.resource?.path,
      row.resource?.method,
      row.role?.name,
    ]);
  });

  readonly dialogVisible = signal(false);
  readonly selectedRole = signal<Role | null>(null);
  readonly selectedResource = signal<Resource | null>(null);
  readonly canSave = computed(
    () => !!this.selectedRole() && !!this.selectedResource() && !this.saving(),
  );

  protected readonly methodSeverity = methodSeverity;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      rows: this.api.list(),
      roles: this.session.canPermission('GET /api/roles') ? this.rolesApi.list() : of<Role[]>([]),
      resources: this.session.canPermission('GET /api/recursos')
        ? this.resourcesApi.list()
        : of<Resource[]>([]),
    }).subscribe({
      next: ({ rows, roles, resources }) => {
        this.rows.set(rows);
        this.roles.set(roles);
        this.resources.set(resources);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  openGrant(): void {
    this.selectedRole.set(this.roleFilter());
    this.selectedResource.set(null);
    this.dialogVisible.set(true);
  }

  grant(): void {
    const role = this.selectedRole();
    const resource = this.selectedResource();
    if (!role || !resource) {
      return;
    }
    this.saving.set(true);
    this.api.create({ role_id: role.id, resource_id: resource.id }).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          'Permiso concedido',
          `${role.name}: ${resource.method} ${resource.path}`,
        );
        this.afterChange();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo conceder', toApiMessage(error));
      },
    });
  }

  revoke(row: ResourceRole): void {
    this.confirmation.confirm({
      header: 'Retirar permiso',
      message: `¿Retirar ${row.resource?.method} ${row.resource?.path} al rol ${row.role?.name}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () =>
        this.api.deactivate(row.id).subscribe({
          next: () => {
            this.notify.warn('Permiso retirado');
            this.afterChange();
          },
          error: (error: unknown) => this.notify.error('No se pudo retirar', toApiMessage(error)),
        }),
    });
  }

  /** Recarga la tabla y los permisos propios (por si la concesión era de mi rol). */
  private afterChange(): void {
    this.load();
    this.auth.me().subscribe({ error: () => undefined });
  }
}
