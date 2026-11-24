import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { SessionStore } from '../../core/services/session-store';

/**
 * `*appHasPermission="'POST /api/lectores'"`: crea o destruye la vista según el
 * permiso efectivo. Reacciona a `permissions()` gracias a `effect()`.
 * Es UX, no seguridad: el backend vuelve a validar.
 */
@Directive({ selector: '[appHasPermission]' })
export class HasPermission {
  private readonly template = inject(TemplateRef<unknown>);
  private readonly container = inject(ViewContainerRef);
  private readonly session = inject(SessionStore);

  readonly appHasPermission = input.required<string>();

  private rendered = false;

  constructor() {
    effect(() => {
      // Leer `permissions()` registra la dependencia aunque `authEnabled` sea false.
      this.session.permissions();
      const allowed = this.session.canPermission(this.appHasPermission());

      if (allowed && !this.rendered) {
        this.container.createEmbeddedView(this.template);
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.container.clear();
        this.rendered = false;
      }
    });
  }
}
