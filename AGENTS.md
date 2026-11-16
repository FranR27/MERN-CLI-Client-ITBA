# Instrucciones para agentes de código

- Antes de modificar el proyecto, leer `README.md`, `docs/spec.md` y `docs/implementation-plan.md`.
- La especificación es la fuente de verdad. No agregar backend, frontend web, base de datos ni funcionalidades no solicitadas.
- Este repositorio implementa un cliente TUI para el backend existente de CASO 404 en `https://github.com/FranR27/test_JuegoDetective`.
- La URL base local sugerida es `http://localhost:3001/api`.
- Respetar las rutas y contratos reales documentados en `backend/README.md` del repositorio CASO 404. Los endpoints ilustrativos de la consigna que no existen no deben implementarse como si fueran reales.
- El backend actual no tiene usuarios, login ni JWT. No crear flujos de autenticación ni asumir cabeceras Bearer.
- Implementar tanto las operaciones guiadas de CASO 404 como el constructor REST personalizado definido en `docs/spec.md`.
- Mantener la interfaz TUI separada de configuración, cliente HTTP, operaciones del juego e historial.
- Implementar en fases pequeñas y marcar el plan solo cuando el trabajo esté realizado y verificado.
- No guardar credenciales, tokens ni datos sensibles en el repositorio. Excluir archivos locales mediante `.gitignore`.
- Usar mensajes claros en español para la interfaz y documentación.
- Ejecutar las verificaciones disponibles y reportar con precisión qué se probó y qué no.
