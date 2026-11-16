# Plan de implementación (SDD)

Este plan traduce los requisitos de [spec.md](spec.md) en entregas pequeñas y verificables. La especificación es la fuente de verdad: no agregar funcionalidades fuera del alcance sin actualizarla primero.

## Fase 1 — Base del proyecto
- [x] Definir stack y dependencias de la TUI.
- [x] Crear estructura modular de carpetas.
- [x] Configurar scripts de desarrollo y validación.
- [x] Preparar configuración local y exclusiones de Git.

## Fase 2 — Configuración e interfaz
- [x] Implementar carga/solicitud de URL base (sugerida: `http://localhost:3001/api`).
- [x] Permitir consultar y modificar la URL base.
- [x] Implementar menú principal y navegación.
- [x] Añadir flujos de entrada y validación.

## Fase 3 — Cliente HTTP y operaciones de CASO 404
- [x] Implementar cliente HTTP reutilizable con URL base.
- [x] Implementar comprobación de conexión mediante `GET /health`.
- [x] Implementar creación de partidas.
- [x] Implementar consulta de partida por ID.
- [x] Implementar registro de evidencias.
- [x] Implementar validación de acertijos.
- [x] Implementar constructor REST genérico GET/POST/PUT/DELETE y validación JSON para POST/PUT.
- [x] No implementar login/JWT: el backend actual no ofrece autenticación.

## Fase 4 — Respuestas e historial
- [x] Mostrar indicador de carga y duración de cada petición.
- [x] Formatear respuestas y destacar estados HTTP.
- [x] Diferenciar errores HTTP de errores de conexión y resultados de negocio.
- [x] Persistir las últimas 10 peticiones y permitir repetirlas.

## Fase 5 — Verificación y entrega
- [x] Probar los flujos contra el backend de CASO 404 con `STORAGE=memory`.
- [x] Verificar respuestas correctas y casos de error (ID inexistente, evidencia bloqueada, JSON inválido, servidor apagado).
- [x] Comprobar que las rutas ilustrativas no implementadas no se presenten como operaciones integradas.
- [x] Verificar ausencia de secretos y datos locales en Git.
- [x] Documentar instalación, configuración y uso.

## Registro de verificación

- **2026-11-16 — Fase 1 y menú principal (spec de CASO 404):** verificados `npm run typecheck`, `npm test`, `npm run build`, `npm run dev` y la versión compilada en Windows con Node 24. Se probó con una terminal real: navegación con flechas por las nueve opciones, Enter para ejecutar cada opción, retorno al menú, opción Salir y cancelación con Ctrl+C. Las operaciones de CASO 404, la configuración de URL, el constructor REST y el historial permanecen pendientes.
- **2026-11-16 — Fases 2 a 5:** `npm run typecheck`, 58 pruebas y `npm run build` correctos. Prueba de punta a punta con terminal real contra el backend de CASO 404 (`STORAGE=memory`, puerto 3001): configuración inicial, health, creación y consulta de partida, evidencia bloqueada (403) y libre, acertijo incorrecto y correcto, GET inexistente (404), JSON inválido rechazado antes de enviar, POST válido, historial con repetición y modificación de la URL base. Con el servidor apagado se verificó el error de conexión y la cancelación con Ctrl+C. `.mern-cli.json` y `.mern-cli-history.json` están excluidos por `.gitignore`.

## Reglas de trabajo
1. Leer `README.md`, `docs/spec.md` y este plan antes de implementar.
2. Implementar una fase por vez.
3. Ejecutar pruebas o verificaciones después de cada cambio.
4. Usar el contrato real documentado en el README del backend de CASO 404; no inferir endpoints a partir de ejemplos ilustrativos.
5. No agregar autenticación ni modificar el backend como parte de esta entrega.
6. Actualizar esta lista y la documentación cuando cambie el alcance.
