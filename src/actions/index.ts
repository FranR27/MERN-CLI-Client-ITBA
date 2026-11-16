import { runConfigureBaseUrl } from './config.js';
import { runRegisterEvidence } from './evidence.js';
import { runCreateGame, runGetGame } from './games.js';
import { runHealthCheck } from './health.js';
import { runHistory } from './history.js';
import { runCustomRequest } from './request.js';
import { runValidateRiddle } from './riddle.js';
import type { ActionHandlers } from './types.js';

/** Registro de acciones del menú principal. */
export function createActionHandlers(): ActionHandlers {
  return {
    health: runHealthCheck,
    createGame: runCreateGame,
    getGame: runGetGame,
    registerEvidence: runRegisterEvidence,
    validateRiddle: runValidateRiddle,
    request: runCustomRequest,
    history: runHistory,
    config: runConfigureBaseUrl,
  };
}

export type {
  ActionContext,
  ActionHandler,
  ActionHandlers,
  MenuActionId,
  RunnableActionId,
} from './types.js';
