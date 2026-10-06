# SDD — Semana 08

## Resultado

- ✅ Dichos de comportamiento del controlador de aplicación.
- ✅ Pruebas unitarias para la lógica de negocio.
- ✅ Pruebas e2e para la API pública y el endpoint de salud.
- ✅ Validación de configuración y compilación.

## Flujo

1. Definir el comportamiento esperado.
2. Ejecutar la prueba y confirmar el fallo cuando corresponde.
3. Implementar el cambio mínimo.
4. Ejecutar la prueba y revisar el resultado.
5. Ejecutar la suite completa y el build.

## Criterios de aceptación

- Todas las pruebas unitarias y e2e pasan.
- El build termina con código 0.
- El endpoint de salud responde con HTTP 200.
- La imagen Docker se construye y ejecuta como usuario no root.
- CI ejecuta los mismos controles en cada cambio.
