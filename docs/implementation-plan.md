# Plan de implementación (SDD)

Este plan traduce los requisitos de [spec.md](spec.md) en entregas pequeñas y verificables. No agregar funcionalidades fuera del alcance sin actualizar primero la especificación.

## Fase 1 — Base del proyecto
- [ ] Definir stack y dependencias de la TUI.
- [ ] Crear estructura modular de carpetas.
- [ ] Configurar scripts de desarrollo y validación.
- [ ] Preparar configuración local y exclusiones de Git.

## Fase 2 — Interfaz y configuración
- [ ] Implementar carga/solicitud de URL base.
- [ ] Implementar menú principal y navegación.
- [ ] Añadir flujos de entrada y validación.

## Fase 3 — Cliente REST y autenticación
- [ ] Implementar cliente HTTP con URL base.
- [ ] Implementar login con contraseña oculta.
- [ ] Guardar y adjuntar JWT automáticamente.
- [ ] Implementar constructor GET/POST/PUT/DELETE y validación JSON.

## Fase 4 — Respuestas e historial
- [ ] Mostrar spinner y duración de cada petición.
- [ ] Formatear respuestas y destacar estados HTTP.
- [ ] Persistir las últimas 10 peticiones y permitir repetirlas.

## Fase 5 — Verificación y entrega
- [ ] Probar los flujos con una API de ejemplo o backend compatible.
- [ ] Verificar manejo de errores y ausencia de secretos en Git.
- [ ] Documentar instalación, configuración y uso.

## Reglas de trabajo
1. Leer la especificación antes de implementar.
2. Implementar una fase por vez.
3. Ejecutar pruebas o verificaciones después de cada cambio.
4. Si un requisito es ambiguo (por ejemplo, endpoint/campos de registro), dejarlo configurable o consultar antes de fijar un contrato.
5. Actualizar esta lista y la documentación cuando cambie el alcance.
