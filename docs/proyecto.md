# LecturaAbierta API

## Objetivo

API REST con NestJS, TypeScript, Sequelize y SQLite para gestionar bibliotecas, lectores, libros, préstamos, reservas, categorías, autores, sedes y multas.

## Arquitectura

- `src/app`: bootstrap, módulo raíz y controlador de aplicación.
- `src/config`: configuración tipada y validación de entorno.
- `src/common`: excepciones, filtros, guards, interceptors y utilidades compartidas.
- `src/infrastructure`: integración con Sequelize, seguridad, tokens y hashing.
- `src/features/business`: módulos de dominio organizados por caso de uso.
- `test`: pruebas de integración de extremo a extremo.

## Comandos

```bash
npm install
npm run start:dev
npm run test:unit
npm run test:e2e
npm run build
npm run lint
npm run db:seed
```

## Salud

El endpoint `GET /health` devuelve el estado del servicio. La imagen Docker ejecuta una comprobación automática con el mismo endpoint.

## Despliegue

```bash
docker build -t lecturaabierta-api:latest .
docker run --rm -p 3000:3000 --env-file .env lecturaabierta-api:latest
```

## Calidad

El flujo de CI ejecuta lint, pruebas unitarias, pruebas e2e, build y la construcción de la imagen Docker.
