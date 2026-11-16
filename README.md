# MERN-CLI-Client-ITBA

Cliente REST interactivo para terminal (TUI), desarrollado como actividad de ITBA y orientado a probar el backend de **CASO 404** sin depender del frontend React.

## Objetivo

Configurar una API, ejecutar operaciones HTTP desde una interfaz de terminal, visualizar respuestas y tiempos de respuesta, y consultar el historial de peticiones.

Este repositorio contiene únicamente el cliente TUI. El backend se mantiene en el repositorio independiente [test_JuegoDetective](https://github.com/FranR27/test_JuegoDetective).

## Backend de referencia

- URL local predeterminada: `http://localhost:3001/api`.
- Comprobación: `GET /health`.
- Rutas específicas: creación y consulta de partidas, registro de evidencias y validación de acertijos.
- El backend actual no implementa usuarios, login ni JWT. La autenticación no forma parte del alcance inicial de esta integración.

La TUI también tendrá un constructor REST genérico para enviar GET, POST, PUT y DELETE. Que un método esté disponible en el cliente no significa que el backend tenga una ruta que lo implemente.

## Estado

En etapa de especificación y planificación (SDD). Consultá [la especificación funcional](docs/spec.md) y [el plan de implementación](docs/implementation-plan.md).

## Requisitos

- Node.js 20 o superior.
- Backend de CASO 404 en ejecución para probar las operaciones integradas.

## Desarrollo

Los comandos de instalación y ejecución se documentarán cuando se incorpore el código de la aplicación.
