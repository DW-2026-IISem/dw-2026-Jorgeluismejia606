# Retrospectiva del Segundo Parcial

## Qué se hizo bien

- Se utilizó una arquitectura modular y se mantuvo la separación entre negocio, infraestructura y presentación.
- Se centralizó la configuración de entorno y se agregó validación antes del arranque.
- Se incorporó una base de datos multi-dialecto mediante Sequelize.
- Se se agregó Swagger para documentar la API.
- Se implementaron pruebas unitarias y pruebas de integración.
- Se agregó soporte para ejecutar la aplicación en desarrollo con manejo de puerto.

## Dificultades

- La prueba e2e inicialmente no se ejecutaba por una configuración incompatible con Vitest.
- El endpoint de salud no existía, por lo que el contenedor no podía comprobar el servicio.
- No existía Dockerfile ni pipeline CI.
- La documentación técnica estaba incompleta o eliminada en el estado de Git.
- El estado de Git contenía cambios locales en archivos de base de datos, dependencias y código.

## Cambios realizados

- Se corrigió la configuración de Vitest para e2e.
- Se añadió el endpoint de salud.
- Se creó el Dockerfile con usuario no root.
- Se configuró una pipeline de CI.
- Se restauró la documentación técnica.
- Se documentó el proceso SDD y el Kanban.

## Riesgos y mejoras

- Confirmar el comportamiento real de la base de datos en CI.
- Añadir pruebas para los casos de uso de negocio.
- Automatizar la validación de OpenAPI.
- Separar la configuración de desarrollo de producción.
- Revisar las dependencias y la vulnerabilidad de las imágenes.

## Criterios de cierre

- [x] E2E configurada para ejecutarse.
- [x] Health disponible.
- [x] Docker no-root definido.
- [x] CI definido.
- [x] Documentación restaurada.
- [ ] Validación final de E2E, Docker y CI en ejecución.
