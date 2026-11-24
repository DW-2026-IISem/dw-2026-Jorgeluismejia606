import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { SessionStore } from '../../core/services/session-store';
import { watchMediaQuery } from '../../core/utils/media-query';
import { Aside } from '../aside/aside';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { NAV } from './nav.config';

/**
 * Layout persistente: Header, Aside y Footer se montan una sola vez; solo la
 * región central cambia con `<router-outlet />`. El menú se calcula con
 * `computed()` a partir de los permisos efectivos de la sesión (ISS-09).
 */
@Component({
  host: { class: 'block' },
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Aside, Footer, ConfirmDialogModule, DrawerModule, ToastModule],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  protected readonly session = inject(SessionStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  /** `lg` de Tailwind: desde aquí el Aside es fijo y el botón lo alterna. */
  private readonly isDesktop = watchMediaQuery('(min-width: 1024px)');

  readonly sidebarCollapsed = signal(false);
  readonly mobileOpen = signal(false);

  /** Menú filtrado por permisos; se recalcula al cambiar `permissions()`. */
  readonly navGroups = computed<MenuItem[]>(() =>
    NAV.filter((group) => !group.authOnly || this.session.authEnabled)
      .map((group) => ({
        label: group.label,
        expanded: true,
        items: group.items
          .filter((item) => !item.permission || this.session.canPermission(item.permission))
          .map<MenuItem>((item) => ({
            label: item.label,
            icon: item.icon,
            routerLink: item.routerLink,
            routerLinkActiveOptions: { exact: item.routerLink === '/prestamos' },
          })),
      }))
      .filter((group) => (group.items?.length ?? 0) > 0),
  );

  readonly showSession = computed(() => this.session.authEnabled && this.session.isAuthenticated());

  readonly userItems: MenuItem[] = [
    {
      label: 'Mi sesión',
      icon: 'pi pi-user',
      command: () => void this.router.navigate(['/perfil']),
    },
    { label: 'Actualizar permisos', icon: 'pi pi-refresh', command: () => this.refreshAccess() },
    { separator: true },
    { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() },
  ];

  /** Escritorio: alterna el Aside fijo. Móvil: abre el Drawer. */
  protected onMenuToggle(): void {
    if (this.isDesktop()) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
      return;
    }
    this.mobileOpen.set(true);
  }

  protected refreshAccess(): void {
    this.auth.me().subscribe({
      next: () => this.notify.success('Permisos actualizados'),
    });
  }

  protected logout(): void {
    this.auth.logout().subscribe({
      complete: () => {
        this.notify.info('Sesión cerrada');
        void this.router.navigate(['/login']);
      },
    });
  }
}
