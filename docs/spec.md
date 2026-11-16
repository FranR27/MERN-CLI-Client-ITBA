# Especificación funcional — MERN-CLI-Client

## 1. Propósito

Construir una aplicación interactiva de terminal (TUI) que funcione como cliente REST para una API propia desarrollada con Node.js/Express. El usuario podrá autenticarse con JWT y operar sobre endpoints protegidos.

La aplicación es un **cliente**: no debe implementar un backend, una base de datos ni una interfaz web.

## 2. Alcance funcional

### RF-01 — Configuración de la API
- Al iniciar, cargar la URL base desde `.mern-cli.json` si existe.
- Si no existe, solicitarla interactivamente.
- Ejemplo de URL: `http://localhost:4000/api`.
- Validar que la URL tenga un formato válido y conservar la configuración local.

### RF-02 — Menú principal
Mostrar un menú navegable con teclado que permita:
1. Iniciar sesión / registrar usuario.
2. Ejecutar una petición personalizada.
3. Consultar el historial de peticiones.
4. Consultar el estado del JWT actual.
5. Salir.

### RF-03 — Autenticación JWT
- Solicitar email y contraseña; la contraseña debe ingresarse de forma oculta.
- Enviar las credenciales a `POST /auth/login`.
- Si la respuesta contiene un JWT válido, conservarlo localmente y usarlo automáticamente en las peticiones posteriores mediante `Authorization: Bearer <token>`.
- La persistencia del token debe ser local y nunca imprimir el valor completo del token en pantalla o logs.
- La opción de registro debe permitir enviar los datos requeridos por el backend; como el contrato de registro no está definido en la consigna, la ruta y los campos deberán poder configurarse o documentarse sin asumir un esquema universal.

### RF-04 — Constructor de peticiones
- Permitir seleccionar GET, POST, PUT o DELETE.
- Solicitar una ruta relativa, por ejemplo `/productos` o `/usuarios/64ab3...`.
- Para POST y PUT, solicitar un body JSON y validarlo antes de enviarlo.
- Adjuntar el JWT automáticamente cuando esté disponible.

### RF-05 — Visualización de respuestas
- Mostrar un indicador de carga mientras se ejecuta la petición.
- Medir y mostrar el tiempo de respuesta en milisegundos.
- Colorear estados HTTP: verde para 2xx, amarillo para 4xx y rojo para 5xx.
- Mostrar JSON con indentación y resaltado; cuando la respuesta sea un arreglo de objetos, se puede presentar en formato de tabla.

### RF-06 — Historial (desafío extra)
- Guardar localmente las últimas 10 peticiones.
- Registrar método, ruta, estado HTTP y fecha.
- Permitir seleccionar una entrada y volver a ejecutar la petición.

## 3. Requisitos no funcionales
- Interfaz clara, consistente y operable desde una terminal.
- Mensajes de error comprensibles para errores HTTP, problemas de conexión y JSON inválido.
- Separar la interfaz TUI de la lógica de configuración, autenticación, peticiones e historial.
- No incluir credenciales, tokens ni datos sensibles en el repositorio.
- Mantener la implementación acotada a lo solicitado en la actividad.

## 4. Supuestos y puntos configurables
- La URL base, las rutas y los esquemas de datos dependen del backend de cada desarrollador.
- La consigna fija `POST /auth/login`, pero no define el formato exacto de la respuesta. La implementación deberá validar y documentar el campo esperado para el JWT.
- La consigna menciona registrar usuario, pero no especifica endpoint ni campos; no se debe inventar un contrato rígido.
- El token podrá persistirse localmente; el archivo de datos local debe quedar excluido de Git.

## 5. Criterios de aceptación
- [ ] La aplicación carga o solicita una URL base.
- [ ] El menú principal permite navegar y entrar a cada opción.
- [ ] El login oculta la contraseña y envía `POST /auth/login`.
- [ ] Un JWT recibido se adjunta como Bearer en las peticiones siguientes.
- [ ] Se pueden enviar GET, POST, PUT y DELETE a rutas relativas.
- [ ] Los bodies de POST/PUT se validan como JSON antes del envío.
- [ ] La respuesta muestra estado HTTP, tiempo y contenido legible.
- [ ] El historial conserva como máximo 10 entradas y permite repetir una petición.
- [ ] Los datos sensibles y archivos locales no se suben al repositorio.
