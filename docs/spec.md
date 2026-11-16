# Especificación funcional — MERN-CLI-Client

## 1. Propósito

Construir una aplicación interactiva de terminal (TUI) que permita probar el backend de **CASO 404** de forma aislada, sin depender del frontend React. La aplicación permitirá configurar la URL de la API, navegar por un menú, ejecutar operaciones específicas del juego y realizar peticiones REST personalizadas.

La TUI es un cliente: no debe implementar un backend, una base de datos ni una interfaz web. El backend de referencia vive en el repositorio independiente [FranR27/test_JuegoDetective](https://github.com/FranR27/test_JuegoDetective).

## 2. Alcance y decisiones

- La API de referencia es el backend existente de CASO 404.
- La URL base local predeterminada será `http://localhost:3001/api`.
- La TUI ofrecerá operaciones guiadas para las rutas que realmente existen.
- También incluirá un constructor REST genérico con GET, POST, PUT y DELETE.
- La disponibilidad de esos cuatro métodos en el cliente no implica que el backend implemente todos ellos. Actualmente las rutas de CASO 404 utilizan GET y POST.
- La consigna menciona login y JWT de forma condicional (“si se implementa una autenticación compatible”). El backend actual no tiene usuarios, login ni JWT; por lo tanto, autenticación y gestión de tokens quedan fuera del alcance inicial.
- No se deben inventar endpoints para completar ejemplos ilustrativos de la consigna. En particular, `GET /api/partidas`, `PUT /api/partidas/:id` y `GET /api/evidencias` no están implementados en el backend actual.

## 3. API de referencia: contrato real

Todas las rutas se encuentran bajo el prefijo `/api` y utilizan JSON.

| Método | Ruta | Entrada | Resultado esperado |
|---|---|---|---|
| GET | `/health` | Sin body | Estado del servidor, servicio, almacenamiento y hora. |
| POST | `/partidas` | Body opcional: `{ "capitulo": 1 }` | Crea una partida; responde `201` y devuelve la partida. |
| GET | `/partidas/:id` | ID en la ruta | Devuelve el estado de una partida. |
| POST | `/partidas/:id/evidencias` | `{ "evidenciaId": "ev_..." }` | Registra una evidencia encontrada y devuelve la partida actualizada. |
| POST | `/partidas/:id/acertijos/:acertijoId/validar` | `{ "respuesta": "..." }` | Valida la respuesta y devuelve el resultado y el estado de la partida. |

### 3.1 Respuestas relevantes

- La creación de una partida devuelve HTTP `201`.
- Una consulta correcta, el registro de una evidencia o la validación de un acertijo devuelven HTTP `200`.
- La validación de un acertijo puede responder HTTP `200` tanto si la respuesta es correcta como si es incorrecta. El resultado se indica en el campo `correcto`; una respuesta incorrecta no debe tratarse como error HTTP.
- Los errores se devuelven en JSON con la estructura `{ "error": { "codigo": "...", "mensaje": "..." } }`.
- Entre los estados de error documentados por el backend se encuentran `400` (entrada inválida), `403` (evidencia bloqueada), `404` (recurso o ruta inexistente) y `500` (error interno).

La TUI debe mostrar tanto el estado HTTP como el contenido de la respuesta, sin confundir un resultado de negocio negativo con un error de transporte.

## 4. Requisitos funcionales

### RF-01 — Configuración de la API
- Cargar la URL base desde `.mern-cli.json` si existe.
- Si no existe, solicitarla al usuario.
- Usar `http://localhost:3001/api` como valor sugerido.
- Validar el formato de la URL y permitir modificarla desde el menú.
- No incluir configuraciones locales sensibles en Git.

### RF-02 — Menú principal
Mostrar un menú navegable con teclado que permita:
1. Comprobar conexión con la API.
2. Crear una partida.
3. Consultar una partida por ID.
4. Registrar una evidencia en una partida.
5. Validar la respuesta de un acertijo.
6. Ejecutar una petición REST personalizada.
7. Consultar el historial de peticiones.
8. Configurar o visualizar la URL base.
9. Salir.

### RF-03 — Comprobación de conexión
- Ejecutar `GET /health` usando la URL base configurada.
- Mostrar si el backend respondió correctamente.
- Mostrar el JSON recibido y el tiempo de respuesta.
- Diferenciar un error HTTP de un error de conexión (por ejemplo, servidor apagado).

### RF-04 — Crear partida
- Permitir indicar el capítulo; ofrecer capítulo 1 como valor inicial.
- Enviar `POST /partidas` con `{ "capitulo": 1 }` o el capítulo elegido.
- Permitir crear la partida con el body opcional omitido si corresponde.
- Mostrar la partida creada y destacar su ID para poder utilizarlo en operaciones posteriores.

### RF-05 — Consultar partida
- Solicitar el ID de partida.
- Ejecutar `GET /partidas/:id`.
- Mostrar el estado de la partida en JSON legible.

### RF-06 — Registrar evidencia
- Solicitar el ID de partida y el ID de evidencia.
- Enviar `POST /partidas/:id/evidencias` con `{ "evidenciaId": "..." }`.
- Mostrar la respuesta, incluyendo errores como evidencia bloqueada o inexistente.

### RF-07 — Validar acertijo
- Solicitar ID de partida, ID de acertijo y respuesta.
- Enviar `POST /partidas/:id/acertijos/:acertijoId/validar` con `{ "respuesta": "..." }`.
- Mostrar `correcto`, `yaResuelto`, `evidenciasDesbloqueadas` y la partida devuelta.
- No guardar ni imprimir innecesariamente la respuesta ingresada.

### RF-08 — Constructor REST personalizado
- Permitir seleccionar GET, POST, PUT o DELETE.
- Solicitar una ruta relativa a la URL base, por ejemplo `/partidas/ID`.
- Para POST y PUT, permitir ingresar un body JSON y validarlo antes de enviarlo.
- Permitir enviar la petición aunque la ruta no pertenezca a los endpoints conocidos; la API determinará si existe.
- Mostrar claramente método, URL final, estado HTTP, duración y respuesta.
- No agregar JWT ni cabeceras de autenticación que el backend no utiliza.

### RF-09 — Visualización de respuestas
- Mostrar un indicador de carga durante cada petición.
- Medir y mostrar el tiempo de respuesta en milisegundos.
- Destacar estados HTTP: verde para 2xx, amarillo para 4xx y rojo para 5xx.
- Formatear JSON con indentación y resaltado; los arreglos de objetos pueden mostrarse como tabla cuando resulte legible.
- Mostrar errores de conexión, timeout y JSON inválido con mensajes comprensibles.

### RF-10 — Historial
- Guardar localmente las últimas 10 peticiones.
- Registrar método, ruta, estado HTTP, duración y fecha.
- No guardar respuestas o cuerpos que puedan contener datos sensibles de manera predeterminada.
- Permitir seleccionar una entrada y repetir la petición cuando sea posible.

## 5. Requisitos no funcionales

- Interfaz clara, consistente y operable desde una terminal.
- Separar interfaz, configuración, cliente HTTP, operaciones de CASO 404 y gestión del historial.
- Mantener mensajes de la aplicación en español.
- No incluir credenciales, tokens ni datos locales en el repositorio.
- Mantener los proyectos TUI y backend independientes: la TUI consume la API, no modifica el backend como parte de esta entrega.

## 6. Fuera de alcance inicial

- Registro de usuarios, inicio de sesión y autenticación JWT.
- CRUD genérico de partidas si el backend no expone esas operaciones.
- Endpoints ilustrativos no implementados, como `GET /partidas`, `PUT /partidas/:id` y `GET /evidencias`.
- Cambios en la lógica o persistencia del backend de CASO 404.

Si el backend incorpora autenticación o nuevas rutas en el futuro, se deberá actualizar esta especificación antes de implementar el soporte correspondiente.

## 7. Criterios de aceptación

- [ ] La aplicación carga o solicita una URL base y permite modificarla.
- [ ] El menú principal permite navegar por todas las opciones definidas.
- [ ] La comprobación de conexión ejecuta `GET /health` y muestra resultado y duración.
- [ ] Se puede crear una partida mediante `POST /partidas` y visualizar su ID.
- [ ] Se puede consultar una partida mediante `GET /partidas/:id`.
- [ ] Se puede registrar una evidencia con el body requerido.
- [ ] Se puede validar un acertijo y distinguir `correcto: false` de un error HTTP.
- [ ] El constructor personalizado permite GET, POST, PUT y DELETE.
- [ ] Los bodies de POST/PUT se validan como JSON antes del envío.
- [ ] Las respuestas muestran estado HTTP, duración y contenido legible.
- [ ] El historial conserva como máximo 10 peticiones y permite repetirlas.
- [ ] La TUI funciona sin login ni JWT y no intenta llamar endpoints ilustrativos como si existieran.
- [ ] Los archivos locales y datos sensibles no se suben al repositorio.
