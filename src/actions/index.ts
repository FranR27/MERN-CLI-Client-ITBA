import { createPlaceholderAction } from './placeholder.js';
import type { ActionHandlers } from './types.js';

/** Registro de acciones del menú principal. */
export function createActionHandlers(): ActionHandlers {
  return {
    health: createPlaceholderAction('Comprobar conexión con la API', 'RF-03'),
    createGame: createPlaceholderAction('Crear una partida', 'RF-04'),
    getGame: createPlaceholderAction('Consultar una partida por ID', 'RF-05'),
    registerEvidence: createPlaceholderAction('Registrar una evidencia en una partida', 'RF-06'),
    validateRiddle: createPlaceholderAction('Validar la respuesta de un acertijo', 'RF-07'),
    request: createPlaceholderAction('Ejecutar una petición REST personalizada', 'RF-08'),
    history: createPlaceholderAction('Consultar el historial de peticiones', 'RF-10'),
    config: createPlaceholderAction('Configurar o visualizar la URL base', 'RF-01'),
  };
}

export type {
  ActionContext,
  ActionHandler,
  ActionHandlers,
  MenuActionId,
  RunnableActionId,
} from './types.js';
