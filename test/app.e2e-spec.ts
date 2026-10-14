import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

describe('LecturaAbierta API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  it('GET /api/health devuelve 200 y estado ok', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.checks.database.status).toBe('up');
      });
  });

  it('GET /api/lectores/publico es accesible sin autenticación', () => {
    return request(app.getHttpServer()).get('/api/lectores/publico').expect(200);
  });

  it('GET /api/lectores/autenticado-basico rechaza sin x-api-key (401)', () => {
    return request(app.getHttpServer()).get('/api/lectores/autenticado-basico').expect(401);
  });

  it('GET /api/prestamos rechaza sin Bearer token (401)', () => {
    return request(app.getHttpServer()).get('/api/prestamos').expect(401);
  });

  it('flujo de autenticación: registro, login y refresh', async () => {
    const credentials = {
      nombre: 'Admin E2E',
      email: 'admin.e2e@lecturaabierta.com',
      password: 'Password123*',
      rol: 'ADMIN',
    };

    await request(app.getHttpServer()).post('/api/auth/registro').send(credentials).expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    expect(login.body.data.accessToken).toBeDefined();
    expect(login.body.data.refreshToken).toBeDefined();

    const refresh = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: login.body.data.refreshToken })
      .expect(200);

    expect(refresh.body.data.accessToken).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
