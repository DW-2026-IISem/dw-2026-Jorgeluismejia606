import { Component, input } from '@angular/core';

/** Título de una pantalla de negocio. Las acciones se proyectan con `<ng-content />`. */
@Component({
  host: { class: 'block' },
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
