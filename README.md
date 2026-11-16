# MERN-CLI-Client-ITBA

Cliente REST interactivo para terminal (TUI), desarrollado como actividad de ITBA y orientado a probar el backend de **CASO 404** sin depender del frontend React.

## Objetivo

Configurar una API, ejecutar operaciones HTTP desde una interfaz de terminal, visualizar respuestas y tiempos de respuesta, y consultar el historial de peticiones.

Este repositorio contiene únicamente el cliente TUI. El backend se mantiene en el repositorio independiente [test_JuegoDetective](https://github.com/FranR27/test_JuegoDetective).

## Backend de referencia

- URL local predeterminada: `http://localhost:3001/api`.
- Comprobación: `GET /health`.
- Rutas específicas: creación y consulta de partidas, registro de evidencias y validación de acertijos.
- El backend actual no implementa usuarios, login ni JWT. La autenticación no forma parte del alcance de esta integración.

La TUI incluye un constructor REST genérico para enviar GET, POST, PUT y DELETE. Que un método esté disponible en el cliente no significa que el backend tenga una ruta que lo implemente.

## Estado

Fases 1 a 5 completadas. La TUI carga o solicita la URL base, ejecuta las operaciones reales de CASO 404 y el constructor REST, muestra las respuestas y mantiene un historial local de las últimas peticiones. La integración se verificó contra el backend real con `STORAGE=memory`.

Consultá [la especificación funcional](docs/spec.md) y [el plan de implementación](docs/implementation-plan.md).

## Funcionalidades

- **Configuración:** carga `.mern-cli.json`; si no existe, pide la URL base con `http://localhost:3001/api` como valor sugerido. La opción del menú permite verla y modificarla.
- **Menú principal:** nueve opciones navegables con flechas y Enter.
- **Conexión:** `GET /health` con estado, JSON y duración.
- **Partidas:** creación con capítulo opcional, consulta por ID y visualización del ID creado.
- **Evidencias:** registro con `POST /partidas/:id/evidencias`.
- **Acertijos:** validación con `POST /partidas/:id/acertijos/:acertijoId/validar`. Una respuesta incorrecta se muestra como resultado de negocio, no como error HTTP.
- **Constructor REST:** GET, POST, PUT y DELETE sobre cualquier ruta relativa; los bodies de POST y PUT se validan como JSON antes de enviarse.
- **Respuestas:** spinner, estado HTTP coloreado (2xx verde, 4xx amarillo, 5xx rojo), duración en milisegundos y JSON indentado y resaltado.
- **Errores:** se distinguen errores HTTP, de conexión, de timeout (10 s) y respuestas que no son JSON.
- **Historial:** últimas 10 peticiones con método, ruta, estado, duración y fecha. Permite repetirlas; como los bodies no se guardan, al repetir un POST o PUT se solicitan de nuevo.

## Requisitos

- Node.js 20 o superior (probado con Node 24).
- Una terminal interactiva (TTY).
- Backend de CASO 404 en ejecución para usar las operaciones integradas.

## Stack

- TypeScript sobre Node.js con módulos ESM.
- [`@inquirer/prompts`](https://github.com/SBoudrias/Inquirer.js) para el menú y las entradas interactivas.
- `ora` para el indicador de carga y `picocolors` para los colores.
- `fetch` nativo de Node.js para las peticiones HTTP.
- `node:test` y `tsx` para las pruebas.

## Instalación y uso

```bash
npm install
npm run dev
```

En el primer inicio se solicita la URL base y se guarda en `.mern-cli.json`. En el menú se navega con las flechas ↑/↓ y se confirma con Enter. Ctrl+C cancela la operación en curso.

Para ejecutar la versión compilada:

```bash
npm run build
npm start
```

Para probar contra el backend de CASO 404, levantalo con `STORAGE=memory` en el puerto 3001 y usá la URL sugerida.

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
├─ index.ts              # Arranque, validación de TTY y cancelación
├─ app.ts                # Bucle principal: menú → acción → menú
├─ context.ts            # Composición de configuración, HTTP, historial y UI
├─ startup.ts            # Carga o solicitud de la URL base
├─ config/
│  └─ config.ts          # Validación y persistencia de .mern-cli.json
├─ http/
│  ├─ client.ts          # Cliente fetch con timeout y URLs relativas
│  └─ types.ts           # Contratos de peticiones y respuestas
├─ history/
│  └─ history.ts         # Persistencia de las últimas 10 peticiones
├─ actions/              # Una acción por opción del menú
│  ├─ health.ts
│  ├─ games.ts
│  ├─ evidence.ts
│  ├─ riddle.ts
│  ├─ request.ts
│  ├─ history.ts
│  ├─ config.ts
│  ├─ shared.ts          # Ejecución, salida e historial compartidos
│  ├─ validators.ts
│  ├─ types.ts
│  └─ index.ts
├─ ui/
│  ├─ prompts.ts         # Entradas interactivas
│  ├─ spinner.ts         # Indicador de carga
│  ├─ response.ts        # Formato y resaltado de respuestas
│  ├─ ui.ts
│  ├─ theme.ts
│  ├─ banner.ts
│  └─ menu.ts
└─ utils/
tests/                   # Pruebas unitarias de todos los módulos
```

La interfaz está separada de la configuración, el cliente HTTP, las operaciones del juego y el historial. `ActionContext` inyecta esos servicios en cada acción.

## Datos locales

- `.mern-cli.json`: URL base configurada.
- `.mern-cli-history.json`: últimas 10 peticiones; no guarda bodies ni respuestas.

Ambos archivos, al igual que `dist/` y `node_modules/`, están excluidos por `.gitignore`. La aplicación no incluye credenciales ni tokens en el repositorio.

## Verificación

- `npm run typecheck`: sin errores.
- `npm test`: 58 pruebas aprobadas.
- `npm run build`: compilación correcta.
- Prueba de punta a punta contra el backend real (`STORAGE=memory`): health, creación y consulta de partida, evidencia bloqueada (403), evidencia libre, acertijo incorrecto y correcto, petición GET inexistente (404), validación de JSON inválido, repetición desde el historial y salida limpia.
- Servidor apagado: la TUI muestra el error de conexión y permite volver al menú.
