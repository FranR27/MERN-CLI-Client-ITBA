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

Etapa 1 completada: base del proyecto y menú principal navegable con las nueve opciones de RF-02. Las operaciones, el constructor REST, el historial y la configuración de la URL muestran un aviso y se implementarán en las próximas fases.

Consultá [la especificación funcional](docs/spec.md) y [el plan de implementación](docs/implementation-plan.md).

## Requisitos

- Node.js 20 o superior (probado con Node 24).
- Una terminal interactiva (TTY).
- Backend de CASO 404 en ejecución para probar las operaciones integradas (etapas siguientes).

## Stack

- TypeScript sobre Node.js con módulos ESM.
- [`@inquirer/prompts`](https://github.com/SBoudrias/Inquirer.js) para el menú y las entradas interactivas.
- `picocolors` para los colores de la interfaz.
- `fetch` nativo de Node.js para las peticiones HTTP (etapas siguientes).
- `node:test` y `tsx` para las pruebas.

## Instalación y uso

```bash
npm install
npm run dev
```

En el menú se navega con las flechas ↑/↓ y se confirma con Enter. Ctrl+C cancela la operación en curso.

Para ejecutar la versión compilada:

```bash
npm run build
npm start
```

## Scripts

| Script              | Descripción                                        |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Ejecuta la TUI desde el código fuente.             |
| `npm run build`     | Compila TypeScript en `dist/`.                     |
| `npm start`         | Ejecuta la versión compilada.                      |
| `npm run typecheck` | Verifica los tipos de `src/` y `tests/`.           |
| `npm test`          | Ejecuta las pruebas con el runner de Node.js.      |
| `npm run check`     | Ejecuta `typecheck` y las pruebas.                 |

## Estructura

```
src/
├─ index.ts          # Arranque, validación de TTY y cancelación
├─ app.ts            # Bucle principal: menú → acción → menú
├─ actions/          # Acciones de cada opción del menú
│  ├─ types.ts       # Contratos de acciones (punto de extensión)
│  ├─ placeholder.ts # Aviso de funcionalidad pendiente
│  └─ index.ts       # Registro de acciones
└─ ui/
   ├─ theme.ts       # Colores y símbolos
   ├─ banner.ts      # Encabezado de la aplicación
   └─ menu.ts        # Opciones y selector navegable (RF-02)
tests/               # Pruebas del menú y del bucle principal
```

La interfaz está separada de las acciones. En las próximas etapas, `ActionContext` incorporará la configuración de la API, el cliente HTTP y el historial, sin modificar el menú ni el bucle principal.

## Datos locales

La configuración y el historial se guardarán en archivos locales (`.mern-cli*.json`), excluidos por `.gitignore`. La aplicación no incluye credenciales ni datos sensibles en el repositorio.
