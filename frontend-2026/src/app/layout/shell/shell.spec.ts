import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SessionStore } from '../../core/services/session-store';
import { Shell } from './shell';

describe('Shell', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();
  });

  async function crearShell() {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    return { fixture, compilado: fixture.nativeElement as HTMLElement };
  }

  it('composes header, aside, main, footer and the router outlet', async () => {
    const { compilado } = await crearShell();
    expect(compilado.querySelector('app-header')).toBeTruthy();
    expect(compilado.querySelector('aside app-aside')).toBeTruthy();
    expect(compilado.querySelector('main#contenido router-outlet')).toBeTruthy();
    expect(compilado.querySelector('app-footer')).toBeTruthy();
  });

  it('opens the mobile drawer from the header button', async () => {
    const { fixture, compilado } = await crearShell();
    (
      compilado.querySelector(
        'app-header button[aria-label="Mostrar u ocultar el menú"]',
      ) as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.mobileOpen()).toBe(true);
  });

  it('filters the menu by effective permissions (bibliotecario)', async () => {
    TestBed.inject(SessionStore).setAccess({
      user: { id: 2, username: 'bibliotecario', email: 'b@x.com', avatar: null, status: 'active' },
      permissions: [
        'GET /api/lectores',
        'GET /api/libros',
        'GET /api/prestamos',
        'POST /api/prestamos',
      ].map((p, i) => {
        const [method, path] = p.split(' ');
        return {
          resource_id: i,
          method: method as 'GET',
          path,
          description: null,
          role_id: 2,
          role_name: 'BIBLIOTECARIO',
        };
      }),
    });
    const { fixture } = await crearShell();
    const labels = fixture.componentInstance
      .navGroups()
      .flatMap((g) => (g.items ?? []).map((i) => i.label));
    expect(labels).toContain('Lectores');
    expect(labels).toContain('Nuevo préstamo');
    expect(labels).not.toContain('Categorías');
    expect(labels).not.toContain('Usuarios');
  });
});
