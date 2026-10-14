import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { SedeModel } from '../src/features/business/sedes/infrastructure/persistence/models/sede.model';
import { CategoriaModel } from '../src/features/business/categorias/infrastructure/persistence/models/categoria.model';
import { LibroModel } from '../src/features/business/libros/infrastructure/persistence/models/libro.model';
import { EjemplarModel } from '../src/features/business/ejemplares/infrastructure/persistence/models/ejemplar.model';

const BASIC_API_KEY = 'test-basic-api-key';
const admin = { email: 'admin.e2e@lecturaabierta.com', password: 'Password123*', rol: 'ADMIN' };
const lector = { email: 'lector.e2e@lecturaabierta.com', password: 'Password123*', rol: 'LECTOR' };
const bibliotecario = {
  email: 'biblio.e2e@lecturaabierta.com',
  password: 'Password123*',
  rol: 'BIBLIOTECARIO',
};

describe('LecturaAbierta API (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  let adminToken = '';
  let lectorToken = '';
  let bibliotecarioToken = '';
  let ejemplarId = 0;

  const register = (user: typeof admin) =>
    request(http).post('/api/auth/registro').send({ nombre: user.email, ...user });

  const login = async (user: typeof admin): Promise<string> => {
    const res = await request(http)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);
    return res.body.data.accessToken as string;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
    http = app.getHttpServer();

    // Usuarios con los tres roles para probar Nivel 4
    await register(admin).expect(201);
    await register(lector).expect(201);
    await register(bibliotecario).expect(201);

    adminToken = await login(admin);
    lectorToken = await login(lector);
    bibliotecarioToken = await login(bibliotecario);

    // Datos mínimos para poder crear un préstamo válido (FKs)
    const sede = await SedeModel.create({ nombre: 'Sede Central' });
    const categoria = await CategoriaModel.create({ nombre: 'General' });
    const libro = await LibroModel.create({ nombre: 'Libro E2E', categoria_id: categoria.id });
    const ejemplar = await EjemplarModel.create({
      libro_id: libro.id,
      sede_id: sede.id,
      nombre: 'Ejemplar E2E',
    });
    ejemplarId = ejemplar.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health devuelve 200 y estado ok', () =>
    request(http)
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.checks.database.status).toBe('up');
      }));

  // ---------------------------------------------------------------------------
  // NIVEL 1 — SIN AUTENTICACIÓN
  // ---------------------------------------------------------------------------
  describe('Nivel 1 - Sin autenticación', () => {
    it('GET /api/lectores/publico responde 200 sin cabeceras', () =>
      request(http)
        .get('/api/lectores/publico')
        .expect(200)
        .expect((res) => expect(res.body.data.nivel).toContain('Nivel 1')));

    it('GET /api/prestamos/estadisticas-publicas responde 200 sin cabeceras', () =>
      request(http)
        .get('/api/prestamos/estadisticas-publicas')
        .expect(200)
        .expect((res) => expect(res.body.data.totalPrestamosRegistrados).toBeDefined()));
  });

  // ---------------------------------------------------------------------------
  // NIVEL 2 — SOLO AUTENTICACIÓN (x-api-key)
  // ---------------------------------------------------------------------------
  describe('Nivel 2 - Solo autenticación (x-api-key)', () => {
    it('GET /api/lectores/autenticado-basico responde 401 sin x-api-key', () =>
      request(http).get('/api/lectores/autenticado-basico').expect(401));

    it('GET /api/lectores/autenticado-basico responde 200 con x-api-key válida', () =>
      request(http)
        .get('/api/lectores/autenticado-basico')
        .set('x-api-key', BASIC_API_KEY)
        .expect(200));

    it('GET /api/prestamos/resumen-interno responde 401 sin x-api-key', () =>
      request(http).get('/api/prestamos/resumen-interno').expect(401));

    it('GET /api/prestamos/resumen-interno responde 200 con x-api-key válida', () =>
      request(http)
        .get('/api/prestamos/resumen-interno')
        .set('x-api-key', BASIC_API_KEY)
        .expect(200));
  });

  // ---------------------------------------------------------------------------
  // NIVEL 3 — AUTENTICACIÓN + JWT + REFRESH
  // ---------------------------------------------------------------------------
  describe('Nivel 3 - JWT Token + Refresh', () => {
    it('GET /api/prestamos responde 401 sin Bearer token', () =>
      request(http).get('/api/prestamos').expect(401));

    it('GET /api/prestamos responde 200 con Bearer token válido', () =>
      request(http)
        .get('/api/prestamos')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200));

    it('GET /api/lectores/jwt responde 200 con Bearer token de LECTOR', () =>
      request(http)
        .get('/api/lectores/jwt')
        .set('Authorization', `Bearer ${lectorToken}`)
        .expect(200));

    it('POST /api/auth/refresh rota correctamente los tokens', async () => {
      const res = await request(http)
        .post('/api/auth/login')
        .send({ email: lector.email, password: lector.password })
        .expect(200);

      const refreshed = await request(http)
        .post('/api/auth/refresh')
        .send({ refreshToken: res.body.data.refreshToken })
        .expect(200);

      expect(refreshed.body.data.accessToken).toBeDefined();
      expect(refreshed.body.data.refreshToken).toBeDefined();
    });

    it('POST /api/auth/refresh responde 403 con refresh token inválido', () =>
      request(http)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token-invalido-123' })
        .expect(403));
  });

  // ---------------------------------------------------------------------------
  // NIVEL 4 — JWT + REFRESH + RBAC
  // ---------------------------------------------------------------------------
  describe('Nivel 4 - JWT + Refresh + RBAC', () => {
    it('POST /api/lectores responde 403 con rol LECTOR', () =>
      request(http)
        .post('/api/lectores')
        .set('Authorization', `Bearer ${lectorToken}`)
        .send({ nombre: 'Intento Denegado' })
        .expect(403));

    it('POST /api/lectores responde 201 con rol ADMIN', async () => {
      const res = await request(http)
        .post('/api/lectores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Lector Autorizado' })
        .expect(201);
      expect(res.body.data.data.nombre).toBe('Lector Autorizado');
    });

    it('POST /api/prestamos responde 403 con rol LECTOR', () =>
      request(http)
        .post('/api/prestamos')
        .set('Authorization', `Bearer ${lectorToken}`)
        .send({ lector_id: 1, ejemplar_id: ejemplarId })
        .expect(403));

    it('POST /api/prestamos responde 201 con rol BIBLIOTECARIO', async () => {
      const nuevoLector = await request(http)
        .post('/api/lectores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Lector Para Préstamo' })
        .expect(201);

      const lectorId = nuevoLector.body.data.data.id;

      const res = await request(http)
        .post('/api/prestamos')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({
          lector_id: lectorId,
          ejemplar_id: ejemplarId,
          fecha_inicio: '2026-01-01',
          fecha_fin: '2026-01-15',
        })
        .expect(201);

      expect(res.body.data.data.lector_id).toBe(lectorId);
    });
  });
});
