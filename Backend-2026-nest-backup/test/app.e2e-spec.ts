import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { seedAuth } from '../src/database/seeders/auth.seeder';
import { UserModel, UserRole } from '../src/features/auth/infrastructure/persistence/models/user.model';
import { SedeModel } from '../src/features/business/sedes/infrastructure/persistence/models/sede.model';
import { CategoriaModel } from '../src/features/business/categorias/infrastructure/persistence/models/categoria.model';
import { LibroModel } from '../src/features/business/libros/infrastructure/persistence/models/libro.model';
import { EjemplarModel } from '../src/features/business/ejemplares/infrastructure/persistence/models/ejemplar.model';

const BASIC_API_KEY = 'test-basic-api-key';
const admin = { email: 'admin.e2e@lecturaabierta.com', password: 'Password123*' };
const lector = { email: 'lector.e2e@lecturaabierta.com', password: 'Password123*' };
const bibliotecario = { email: 'biblio.e2e@lecturaabierta.com', password: 'Password123*' };

describe('LecturaAbierta API (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  let adminToken = '';
  let lectorToken = '';
  let bibliotecarioToken = '';
  let ejemplarId = 0;
  let segundoEjemplarId = 0;

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
    // Misma configuración global que src/main.ts
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
    http = app.getHttpServer();

    // Roles, recursos y concesiones del RBAC (PermissionGuard)
    await seedAuth();

    // El registro público siempre crea LECTOR; los roles privilegiados se
    // asignan directamente en BD (en la app real, vía /api/usuarios).
    await register(admin).expect(201);
    await register(lector).expect(201);
    await register(bibliotecario).expect(201);
    await UserModel.update({ rol: UserRole.ADMIN }, { where: { email: admin.email } });
    await UserModel.update({ rol: UserRole.BIBLIOTECARIO }, { where: { email: bibliotecario.email } });

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
    const segundo = await EjemplarModel.create({
      libro_id: libro.id,
      sede_id: sede.id,
      nombre: 'Ejemplar E2E 2',
    });
    segundoEjemplarId = segundo.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ---------------------------------------------------------------------------
  // REGISTRO PÚBLICO
  // ---------------------------------------------------------------------------
  describe('Registro público', () => {
    it('POST /api/auth/registro rechaza el campo rol (400)', () =>
      request(http)
        .post('/api/auth/registro')
        .send({ nombre: 'Atacante', email: 'x@lecturaabierta.com', password: 'Password123*', rol: 'ADMIN' })
        .expect(400));

    it('POST /api/auth/registro crea siempre un LECTOR', async () => {
      const res = await request(http)
        .post('/api/auth/registro')
        .send({ nombre: 'Nuevo', email: 'nuevo@lecturaabierta.com', password: 'Password123*' })
        .expect(201);
      expect(res.body.data.rol).toBe('LECTOR');
    });
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
        .send({ lectorId: 1, ejemplarId, fechaFin: '2026-01-15T00:00:00Z' })
        .expect(403));

    it('POST /api/lectores rechaza campos fuera del DTO (400)', () =>
      request(http)
        .post('/api/lectores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Con extras', id: 999, is_active: false })
        .expect(400));

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
        .send({ lectorId, ejemplarId, fechaFin: '2026-01-15T00:00:00Z' })
        .expect(201);

      expect(res.body.data.data.lector_id).toBe(lectorId);
      const ejemplar = await EjemplarModel.findByPk(ejemplarId);
      expect(ejemplar!.estado).toBe('PRESTADO');

      // RN-01: el mismo ejemplar no puede prestarse dos veces
      await request(http)
        .post('/api/prestamos')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({ lectorId, ejemplarId, fechaFin: '2026-01-20T00:00:00Z' })
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // PRÉSTAMOS TRANSACCIONALES (PermissionGuard)
  // ---------------------------------------------------------------------------
  describe('Préstamos transaccionales', () => {
    it('registrar → devolver con retraso libera el ejemplar y genera multa', async () => {
      const lectorRes = await request(http)
        .post('/api/lectores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Lector Devolución' })
        .expect(201);

      const prestamo = await request(http)
        .post('/api/prestamos/registrar')
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({
          lectorId: lectorRes.body.data.data.id,
          ejemplarId: segundoEjemplarId,
          fechaFin: '2026-01-10T00:00:00Z',
        })
        .expect(201);

      const res = await request(http)
        .patch(`/api/prestamos/${prestamo.body.data.id}/devolver`)
        .set('Authorization', `Bearer ${bibliotecarioToken}`)
        .send({ fechaDevolucion: '2026-01-13T00:00:00Z' })
        .expect(200);

      expect(res.body.data.estado).toBe('DEVUELTO');
      expect(res.body.data.multas).toHaveLength(1);
      expect(res.body.data.multas[0].monto).toBe(4.5);
      const ejemplar = await EjemplarModel.findByPk(segundoEjemplarId);
      expect(ejemplar!.estado).toBe('DISPONIBLE');
    });
  });
});
