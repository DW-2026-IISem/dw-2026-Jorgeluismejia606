import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';
import { Libro } from '../../libros/libro.model';
import { PrestamoForm } from './prestamo-form';

const API = environment.apiUrl;

@Component({ template: '' })
class Destino {}
const LIBROS: Libro[] = [
  {
    id: 1,
    titulo: 'Cien años',
    autor: 'GGM',
    precio_prestamo: '2500.00',
    stock_minimo: 1,
    cantidad: 3,
    categoria_id: 1,
    status: 'active',
  },
];

describe('PrestamoForm', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestamoForm],
      providers: [
        provideRouter([{ path: 'prestamos', component: Destino }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function crear() {
    const fixture = TestBed.createComponent(PrestamoForm);
    http.expectOne(`${API}/lectores`).flush({
      lectores: [
        { id: 1, nombre: 'Ana', direccion: null, telefono: null, email: null, status: 'active' },
      ],
    });
    http.expectOne(`${API}/libros`).flush({ libros: LIBROS });
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  it('groups lines of the same book and computes totals from DECIMAL strings', async () => {
    const form = await crear();
    form.selectedLibroId.set(1);
    form.addLine();
    form.selectedLibroId.set(1);
    form.addLine();
    expect(form.lines()).toEqual([{ libro_id: 1, cantidad: 2 }]);
    form.descuentos.set(500);
    expect(form.subtotal()).toBe(5000);
    expect(form.total()).toBe(4500);
  });

  it('blocks a line that exceeds the available copies (no request)', async () => {
    const form = await crear();
    form.selectedLibroId.set(1);
    form.cantidad.set(4);
    form.addLine();
    expect(form.lines()).toEqual([]);
    expect(form.error()).toContain('Ejemplares insuficientes');
  });

  it('sends one transactional POST without prices or totals', async () => {
    const form = await crear();
    form.lectorId.set(1);
    form.selectedLibroId.set(1);
    form.addLine();
    form.save();
    const alta = http.expectOne(`${API}/prestamos`);
    expect(alta.request.method).toBe('POST');
    expect(alta.request.body).toEqual({
      lector_id: 1,
      impuesto: 0,
      descuentos: 0,
      items: [{ libro_id: 1, cantidad: 1 }],
    });
    alta.flush({ prestamo: { id: 9 }, items: [] });
  });
});
