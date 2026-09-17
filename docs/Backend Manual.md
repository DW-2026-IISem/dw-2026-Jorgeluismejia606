FASE 1 — 00_BASE_INIT_NESTJS

Inicialización del proyecto NestJS

Objetivo de la fase: Dejar el esqueleto oficial Nest corriendo en un puerto libre, con Git inicial.

1.1 — Crear carpetas padre y permisos
![alt text](<Captura de pantalla 2026-09-09 102859.png>)

1.2 — Instalar Nest CLI (si no existe)
![alt text](<Captura de pantalla 2026-09-09 103015.png>)

1.3 — Crear proyecto NestJS
![alt text](<Captura de pantalla 2026-09-09 103404.png>)

1.4 — Crear .env
![alt text](<Captura de pantalla 2026-09-09 103541.png>)

1.5 — Commit inicial del esqueleto
![alt text](<Captura de pantalla 2026-09-09 104019.png>)

FASE 2 — 01_BASE_DEPS_Y_PUERTO

Dependencias + manejo de puerto (EADDRINUSE)

Objetivo de la fase: Instalar el stack profesional y evitar que un start:dev colgado bloquee el puerto.

2.1 — Dependencias de producción
![alt text](<Captura de pantalla 2026-09-09 104819.png>)

2.2 — Dependencias de desarrollo
![alt text](<Captura de pantalla 2026-09-09 104957.png>)

2.3 — Script para liberar puerto
![alt text](<Captura de pantalla 2026-09-09 105257.png>)

2.4 — Actualizar scripts npm en package.json
![alt text](<Captura de pantalla 2026-09-09 105351.png>)

2.5 — Verificar arranque base
![alt text](<Captura de pantalla 2026-09-09 115406.png>)

FASE 3 — 02_BASE_ESTRUCTURA_CA

Estructura de carpetas Clean Architecture

Objetivo de la fase: Crear el mapa mental: config / common / infrastructure / features (business + auth).

3.1 — Crear árbol base de carpetas
![alt text](<Captura de pantalla 2026-09-09 115652.png>)

FASE 4 — 03_BASE_ENTORNO_ENV

Configuración del entorno tipado (multi-base)

Objetivo de la fase: Centralizar variables en .env: selector DB_DIALECT y un bloque de credenciales por motor (MySQL, PostgreSQL, SQL Server, Oracle). Validar antes del boot.

4.1 — Crear .env.example y actualizar .env completo
![alt text](<Captura de pantalla 2026-09-09 120719.png>)
![alt text](<Captura de pantalla 2026-09-09 120823.png>)

4.2 — Interface de entorno
![alt text](<Captura de pantalla 2026-09-09 121417.png>)

4.3 — Validación de entorno con class-validator
![alt text](<Captura de pantalla 2026-09-09 121659.png>)
![alt text](<Captura de pantalla 2026-09-09 121936.png>)
![alt text](<Captura de pantalla 2026-09-09 122003.png>)
![alt text](<Captura de pantalla 2026-09-09 122033.png>)

4.4 — Resolver de credenciales por motor
![alt text](<Captura de pantalla 2026-09-14 200651.png>)
![alt text](<Captura de pantalla 2026-09-14 200718.png>)

4.5 — Factory registerAs de entorno
![alt text](<Captura de pantalla 2026-09-14 201024.png>)

FASE 5 — 04_BASE_DATABASE_SEQUELIZE

Base de datos multi-dialecto (Sequelize)

Objetivo de la fase: Conectar Sequelize al motor de DB_DIALECT usando el bloque DB_MYSQL_* / DB_POSTGRES_* / DB_MSSQL_* / DB_ORACLE_*. Aún sin features (ALL_MODELS vacío).

5.1 — Constante SEQUELIZE_TOKEN
![alt text](<Captura de pantalla 2026-09-14 201232.png>)

5.2 — Tipos auxiliares de database config
![alt text](<Captura de pantalla 2026-09-14 201534.png>)

5.3 — database.config.ts
![alt text](<Captura de pantalla 2026-09-14 201713.png>)

5.4 — database.module.ts / providers
![alt text](<Captura de pantalla 2026-09-14 201909-1.png>)

5.5 — database.providers.ts
![alt text](<Captura de pantalla 2026-09-14 202135.png>)

5.6 — Opciones Sequelize por dialecto
![alt text](<Captura de pantalla 2026-09-14 202349.png>)

5.7 — Factory Sequelize (sin modelos aún)
![alt text](<Captura de pantalla 2026-09-16 083021.png>)

5.8 — DatabaseSeederService
![alt text](<Captura de pantalla 2026-09-16 083128.png>)

5.9 — Módulo global Sequelize
![alt text](<Captura de pantalla 2026-09-16 083215.png>)

5.10 — Verificar conexión a BD
![alt text](<Captura de pantalla 2026-09-16 092845.png>)

CREACION DEL PROYECTO PASO A PASO LECTURA_ARBIERA
FASE 1 — 00_BASE_INIT_NESTJS
Inicialización del proyecto NestJS
1.1 — Preparar directorio de trabajo
![alt text](<Captura de pantalla 2026-09-09 102859-1.png>)

1.2 — Generar esqueleto oficial con Nest CLI
![alt text](<Captura de pantalla 2026-09-09 104819-1.png>)

1.3 — Crear .env inicial
![alt text](image.png)

FASE 2 — 01_BASE_DEPS_Y_PUERTO
Dependencias y control de puertos
2.1 — Instalar dependencias de producción
Instalación de Sequelize, drivers de bases de datos, validación, utilidades de seguridad y Swagger:
![alt text](<Captura de pantalla 2026-09-09 104819-2.png>)

2.2 — Instalar dependencias de desarrollo
![alt text](<Captura de pantalla 2026-09-09 104957-1.png>)

2.3 — Script de liberación de puerto (free-port.js)
![alt text](image-1.png)

2.4 — Configurar scripts npm en package.json
![alt text](image-2.png)

FASE 3 — 02_BASE_ESTRUCTURA_CA
Estructura de carpetas Clean Architecture

3.1 — Crear directorios por capas y módulos funcionales
![alt text](<Captura de pantalla 2026-09-16 093239.png>)
![alt text](<Captura de pantalla 2026-09-16 093256.png>)

3.2 — Declarar módulos raíz iniciales
![alt text](<Captura de pantalla 2026-09-16 093416.png>)
![alt text](<Captura de pantalla 2026-09-16 093455.png>)

FASE 4 — 03_BASE_ENTORNO_ENV
Configuración del entorno tipado

4.1 — Crear .env.example y plantilla local
![alt text](<Captura de pantalla 2026-09-16 093626.png>)
![alt text](<Captura de pantalla 2026-09-16 093651.png>)

4.2 — Interfaces de configuración tipadas
![alt text](<Captura de pantalla 2026-09-16 093807.png>)
![alt text](<Captura de pantalla 2026-09-16 093828.png>)

4.3 — Validador de entorno
![alt text](<Captura de pantalla 2026-09-16 093924.png>)
![alt text](<Captura de pantalla 2026-09-16 094011.png>)

4.4 — Fábrica de configuración
![alt text](<Captura de pantalla 2026-09-16 094112.png>)
![alt text](<Captura de pantalla 2026-09-16 094156.png>)

FASE 5 — 04_BASE_DATABASE_SEQUELIZE
Conexión a Base de Datos y Factory Sequelize

5.1 — Constante de inyección DI
![alt text](<Captura de pantalla 2026-09-16 094356.png>)
![alt text](<Captura de pantalla 2026-09-16 094443.png>)

5.2 — Opciones multi-dialecto de Sequelize
![alt text](<Captura de pantalla 2026-09-16 094543.png>)
![alt text](<Captura de pantalla 2026-09-16 094633.png>)

5.3 — Fábrica de instancia Sequelize con lista modular de modelos
![alt text](<Captura de pantalla 2026-09-16 094722.png>)
![alt text](<Captura de pantalla 2026-09-16 094741.png>)

5.4 — Servicio ejecutor de Seeders
![alt text](<Captura de pantalla 2026-09-16 094832.png>)
![alt text](<Captura de pantalla 2026-09-16 094851.png>)

5.5 — Módulo global de Sequelize
![alt text](<Captura de pantalla 2026-09-16 094938.png>)
![alt text](<Captura de pantalla 2026-09-16 095001.png>)

FASE 6 — 05_BASE_APP_COMMON_SECURITY
Piezas Transversales, Seguridad y Bootstrap

6.1 — Enums y Reglas de Estado del Dominio
![alt text](<Captura de pantalla 2026-09-16 095100.png>)
![alt text](<Captura de pantalla 2026-09-16 095129.png>)

6.2 — Filtros de Excepciones Globales
![alt text](<Captura de pantalla 2026-09-16 095212.png>)
![alt text](<Captura de pantalla 2026-09-16 095234.png>)

6.3 — Interceptor de Respuestas Unificado
![alt text](<Captura de pantalla 2026-09-16 095318.png>)
![alt text](<Captura de pantalla 2026-09-16 095338.png>)

6.4 — Servicios de Criptografía y Tokens JWT
![alt text](<Captura de pantalla 2026-09-16 095440.png>)
![alt text](<Captura de pantalla 2026-09-16 095518.png>)

6.5 — Configuración de Swagger
![alt text](<Captura de pantalla 2026-09-16 095602.png>)
![alt text](<Captura de pantalla 2026-09-16 095627.png>)

6.6 — Ensamblado de main.ts y app.module.ts base
![alt text](<Captura de pantalla 2026-09-16 095730.png>)
![alt text](<Captura de pantalla 2026-09-16 095815.png>)

FASE 7 — 06_BUSINESS_LECTORES
Entidad Lectores (RF-01)

7.1 — Entidad de Dominio Puro
![alt text](<Captura de pantalla 2026-09-16 095928.png>)
![alt text](<Captura de pantalla 2026-09-16 095952.png>)

7.2 — Modelo Sequelize
![alt text](<Captura de pantalla 2026-09-16 100037.png>)
![alt text](<Captura de pantalla 2026-09-16 100101.png>)

7.3 — Repositorio y Contrato
![alt text](<Captura de pantalla 2026-09-16 100154.png>)
![alt text](<Captura de pantalla 2026-09-16 100220.png>)

7.4 — DTOs, Caso de Uso y Controlador
![alt text](<Captura de pantalla 2026-09-16 100314.png>)
![alt text](<Captura de pantalla 2026-09-16 100349.png>)

7.5 — Módulo Lectores y Registro en ALL_MODELS
![alt text](<Captura de pantalla 2026-09-16 100459.png>)
![alt text](<Captura de pantalla 2026-09-16 100524.png>)
![alt text](<Captura de pantalla 2026-09-16 100608.png>)

FASE 8 — 07_BUSINESS_CATALOGO_BASE
Categorías, Autores y Sedes (RF-03, RF-04, RF-05)

8.1 — Modelos Sequelize
![alt text](<Captura de pantalla 2026-09-16 100757.png>)
![alt text](<Captura de pantalla 2026-09-16 100852.png>)

8.2 — Actualizar fábrica Sequelize
![alt text](<Captura de pantalla 2026-09-16 100959.png>)
![alt text](<Captura de pantalla 2026-09-16 101019.png>)

FASE 9 — 08_BUSINESS_LIBROS_EJEMPLARES
Libros, Relación LibroAutor y Ejemplares (RF-02, RF-06, RN-02, RN-03)

9.1 — Modelos de Libros, LibroAutor y Ejemplares
![alt text](<Captura de pantalla 2026-09-16 101133.png>)
![alt text](<Captura de pantalla 2026-09-16 101207.png>)

9.2 — Actualizar factory Sequelize con catálogo completo
![alt text](<Captura de pantalla 2026-09-16 101244.png>)
![alt text](<Captura de pantalla 2026-09-16 101317.png>)

FASE 10 — 09_BUSINESS_PRESTAMOS_MULTAS
Préstamos, Reservas, Multas y Reglas de Negocio (RN-01 a RN-08)

10.1 — Modelos de Préstamo, Reserva y Multa
![alt text](<Captura de pantalla 2026-09-16 101458.png>)
![alt text](<Captura de pantalla 2026-09-16 101524.png>)
![alt text](<Captura de pantalla 2026-09-16 101545.png>)

10.2 — DTOs para Préstamos y Devolución
![alt text](<Captura de pantalla 2026-09-16 101636.png>)
![alt text](<Captura de pantalla 2026-09-16 101700.png>)

10.3 — Casos de uso y Reglas de Negocio en Préstamos
Implementa transacciones ACID con Sequelize (sequelize.transaction), verificando:

RN-01: Disponibilidad del ejemplar.

RN-05: Bloqueo de renovación si hay reservas activas.

RN-06: Reincorporación a DISPONIBLE al devolver.

RN-08: Cálculo automático de multas por mora, daño o pérdida.
![alt text](<Captura de pantalla 2026-09-16 101830.png>)
![alt text](<Captura de pantalla 2026-09-16 101922.png>)
![alt text](<Captura de pantalla 2026-09-16 101948.png>)

10.4 — Controlador de Préstamos
![alt text](<Captura de pantalla 2026-09-16 102056.png>)
![alt text](<Captura de pantalla 2026-09-16 102118.png>)

10.5 — Registrar todos los modelos de negocio en Sequelize Factory
![alt text](<Captura de pantalla 2026-09-16 102205.png>)
![alt text](<Captura de pantalla 2026-09-16 102228.png>)

FASE 11 — 10_AUTH_RBAC_GUARDS
Autenticación y Control de Acceso Basado en Roles (RBAC)

11.1 — Decorador @Roles y Guardián RBAC
![alt text](<Captura de pantalla 2026-09-16 102340.png>)
![alt text](<Captura de pantalla 2026-09-16 102401.png>)

11.2 — Proteger el Controlador de Préstamos con @Roles
![alt text](<Captura de pantalla 2026-09-16 102443.png>)
![alt text](<Captura de pantalla 2026-09-16 102502.png>)

FASE 12 — 11_INTEGRACION_Y_CHECKLIST
Seed de Datos, Pruebas Unitarias y Verificación

12.1 — Seeder Integral para Poblado de Base de Datos
![alt text](<Captura de pantalla 2026-09-16 102601.png>)
![alt text](<Captura de pantalla 2026-09-16 102631.png>)

12.2 — Suite de Pruebas Automatizadas (Vitest)
Verifica que las reglas de negocio críticas RN-01 y RN-05 arrojen error en las condiciones estipuladas:
![alt text](<Captura de pantalla 2026-09-16 102725.png>)
![alt text](<Captura de pantalla 2026-09-16 102746.png>)

12.3 — Verificación
![alt text](<Captura de pantalla 2026-09-16 104015.png>)

LecturaAbierta API corriendo en
![alt text](image-3.png)