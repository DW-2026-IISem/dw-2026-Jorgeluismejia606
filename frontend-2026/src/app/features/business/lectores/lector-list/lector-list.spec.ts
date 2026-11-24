import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';
import { Lector } from '../lector.model';
import { SessionStore } from '../../../../core/services/session-store';
import { LectorList } from './lector-list';

const BASE = `${environment.apiUrl}/lectores`;
const LECTORES: Lector[] = [
  {
    id: 1,
    nombre: 'Ana Pérez',
    direccion: 'Calle Sur',
    telefono: '300',
    email: 'ana@x.com',
    status: 'active',
  },
  { id: 2, nombre: 'Luis Gómez', direccion: null, telefono: null, email: null, status: 'active' },
];

describe('LectorList', () => {
  let http: HttpTestingController;
  let confirmation: ConfirmationService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LectorList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    confirmation = TestBed.inject(ConfirmationService);
    // Sesión de ADMIN con los permisos de lectores para que la directiva pinte botones.
    TestBed.inject(SessionStore).setAccess({
      user: { id: 1, username: 'admin', email: 'a@x.com', avatar: null, status: 'active' },
      permissions: [
        'GET /api/lectores',
        'POST /api/lectores',
        'PATCH /api/lectores/:id',
        'PATCH /api/lectores/:id/deactivate',
        'DELETE /api/lectores/:id',
      ].map((p, i) => {
        const [method, path] = p.split(' ');
        return {
          resource_id: i + 1,
          method: method as 'GET',
          path,
          description: null,
          role_id: 1,
          role_name: 'ADMIN',
        };
      }),
    });
  });

  afterEach(() => http.verify());

  async function crearLista() {
    const fixture = TestBed.createComponent(LectorList);
    http.expectOne(BASE).flush({ lectores: LECTORES });
    await fixture.whenStable();
    return {
      fixture,
      lista: fixture.componentInstance,
      html: fixture.nativeElement as HTMLElement,
    };
  }

  function aceptarConfirmacion(): void {
    vi.spyOn(confirmation, 'confirm').mockImplementation((options) => {
      options.accept?.();
      return confirmation;
    });
  }

  it('loads and renders one row per lector', async () => {
    const { lista, html } = await crearLista();
    expect(lista.rows()).toHaveLength(2);
    expect(html.textContent).toContain('Ana Pérez');
    expect(html.textContent).toContain('Luis Gómez');
  });

  it('shows the backend error and leaves the table empty', async () => {
    const fixture = TestBed.createComponent(LectorList);
    http
      .expectOne(BASE)
      .flush({ error: 'Missing Bearer token' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    expect(fixture.componentInstance.error()).toBe('Missing Bearer token');
    expect(fixture.componentInstance.rows()).toEqual([]);
  });

  it('filters locally without new requests', async () => {
    const { lista } = await crearLista();
    lista.filter.set('sur');
    expect(lista.visibleRows().map((l) => l.id)).toEqual([1]);
  });

  it('POSTs a new lector and reloads', async () => {
    const { lista } = await crearLista();
    lista.openCreate();
    lista.save({ nombre: 'Nuevo', status: 'active' });
    const alta = http.expectOne(BASE);
    expect(alta.request.method).toBe('POST');
    alta.flush({ lector: { ...LECTORES[0], id: 3, nombre: 'Nuevo' } });
    http.expectOne(BASE).flush({ lectores: LECTORES });
    expect(lista.dialogVisible()).toBe(false);
  });

  it('PATCHes the edited lector without status', async () => {
    const { lista } = await crearLista();
    lista.openEdit(LECTORES[0]);
    lista.save({ nombre: 'Ana P.', telefono: '311' });
    const cambio = http.expectOne(`${BASE}/1`);
    expect(cambio.request.method).toBe('PATCH');
    expect(cambio.request.body).toEqual({ nombre: 'Ana P.', telefono: '311' });
    cambio.flush({ lector: LECTORES[0] });
    http.expectOne(BASE).flush({ lectores: LECTORES });
  });

  it('calls deactivate after confirmation', async () => {
    const { lista } = await crearLista();
    aceptarConfirmacion();
    lista.deactivate(LECTORES[0]);
    const baja = http.expectOne(`${BASE}/1/deactivate`);
    expect(baja.request.method).toBe('PATCH');
    baja.flush({});
    http.expectOne(BASE).flush({ lectores: LECTORES.slice(1) });
  });

  it('calls DELETE after confirmation', async () => {
    const { lista } = await crearLista();
    aceptarConfirmacion();
    lista.remove(LECTORES[1]);
    const borrado = http.expectOne(`${BASE}/2`);
    expect(borrado.request.method).toBe('DELETE');
    borrado.flush({});
    http.expectOne(BASE).flush({ lectores: LECTORES.slice(0, 1) });
  });
});
