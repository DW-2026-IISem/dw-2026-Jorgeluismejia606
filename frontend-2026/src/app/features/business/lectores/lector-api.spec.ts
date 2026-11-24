import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { Lector } from './lector.model';
import { LectorApi } from './lector-api';

const BASE = `${environment.apiUrl}/lectores`;
const LECTOR: Lector = {
  id: 1,
  nombre: 'Ana',
  direccion: null,
  telefono: null,
  email: null,
  status: 'active',
};

describe('LectorApi', () => {
  let api: LectorApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(LectorApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { lectores } into Lector[]', () => {
    let resultado: Lector[] | undefined;
    api.list().subscribe((lectores) => (resultado = lectores));
    const peticion = http.expectOne(BASE);
    expect(peticion.request.method).toBe('GET');
    peticion.flush({ lectores: [LECTOR] });
    expect(resultado).toEqual([LECTOR]);
  });

  it('should build URLs from environment.apiUrl (no trailing slash)', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);
    api.list().subscribe();
    http.expectOne('http://localhost:4000/api/lectores').flush({ lectores: [] });
  });

  it('should PATCH and unwrap { lector }', () => {
    let resultado: Lector | undefined;
    api.update(1, { nombre: 'Ana 2' }).subscribe((lector) => (resultado = lector));
    const peticion = http.expectOne(`${BASE}/1`);
    expect(peticion.request.method).toBe('PATCH');
    peticion.flush({ lector: { ...LECTOR, nombre: 'Ana 2' } });
    expect(resultado?.nombre).toBe('Ana 2');
  });

  it('should deactivate with PATCH /:id/deactivate', () => {
    api.deactivate(3).subscribe();
    const peticion = http.expectOne(`${BASE}/3/deactivate`);
    expect(peticion.request.method).toBe('PATCH');
    peticion.flush({});
  });
});
