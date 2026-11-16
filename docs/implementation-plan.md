# Plan de implementación (SDD)

Este plan traduce los requisitos de [spec.md](spec.md) en entregas pequeñas y verificables. La especificación es la fuente de verdad: no agregar funcionalidades fuera del alcance sin actualizarla primero.

## Fase 1 — Base del proyecto
- [x] Definir stack y dependencias de la TUI.
- [x] Crear estructura modular de carpetas.
- [x] Configurar scripts de desarrollo y validación.
- [x] Preparar configuración local y exclusiones de Git.

## Fase 2 — Configuración e interfaz
- [ ] Implementar carga/solicitud de URL base (sugerida: `http://localhost:3001/api`).
- [ ] Permitir consultar y modificar la URL base.
- [x] Implementar menú principal y navegación.
- [ ] Añadir flujos de entrada y validación.

## Fase 3 — Cliente HTTP y operaciones de CASO 404
- [ ] Implementar cliente HTTP reutilizable con URL base.
- [ ] Implementar comprobación de conexión mediante `GET /health`.
- [ ] Implementar creación de partidas.
- [ ] Implementar consulta de partida por ID.
- [ ] Implementar registro de evidencias.
- [ ] Implementar validación de acertijos.
- [ ] Implementar constructor REST genérico GET/POST/PUT/DELETE y validación JSON para POST/PUT.
- [ ] No implementar login/JWT: el backend actual no ofrece autenticación.

## Fase 4 — Respuestas e historial
- [ ] Mostrar indicador de carga y duración de cada petición.
- [ ] Formatear respuestas y destacar estados HTTP.
- [ ] Diferenciar errores HTTP de errores de conexión y resultados de negocio.
- [ ] Persistir las últimas 10 peticiones y permitir repetirlas.

## Fase 5 — Verificación y entrega
- [ ] Probar los flujos contra el backend de CASO 404 con `STORAGE=memory`.
- [ ] Verificar respuestas correctas y casos de error (ID inexistente, evidencia bloqueada, JSON inválido, servidor apagado).
- [ ] Comprobar que las rutas ilustrativas no implementadas no se presenten como operaciones integradas.
- [ ] Verificar ausencia de secretos y datos locales en Git.
- [ ] Documentar instalación, configuración y uso.

## Registro de verificación

- **2026-11-16 — Fase 1 y menú principal (spec de CASO 404):** verificados `npm run typecheck`, `npm test`, `npm run build`, `npm run dev` y la versión compilada en Windows con Node 24. Se probó con una terminal real: navegación con flechas por las nueve opciones, Enter para ejecutar cada opción, retorno al menú, opción Salir y cancelación con Ctrl+C. Las operaciones de CASO 404, la configuración de URL, el constructor REST y el historial permanecen pendientes.

## Reglas de trabajo
1. Leer `README.md`, `docs/spec.md` y este plan antes de implementar.
2. Implementar una fase por vez.
3. Ejecutar pruebas o verificaciones después de cada cambio.
4. Usar el contrato real documentado en el README del backend de CASO 404; no inferir endpoints a partir de ejemplos ilustrativos.
5. No agregar autenticación ni modificar el backend como parte de esta entrega.
6. Actualizar esta lista y la documentación cuando cambie el alcance.
