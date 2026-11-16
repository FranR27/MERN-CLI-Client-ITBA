import type { ConfigService } from '../config/config.js';
import type { HistoryStore } from '../history/history.js';
import type { HttpClient } from '../http/client.js';
import type { PromptService } from '../ui/prompts.js';
import type { UiService } from '../ui/ui.js';
import type { PrintFunction } from '../utils/print.js';

/** Identificadores de las opciones del menú principal (RF-02). */
export type MenuActionId =
  | 'health'
  | 'createGame'
  | 'getGame'
  | 'registerEvidence'
  | 'validateRiddle'
  | 'request'
  | 'history'
  | 'config'
  | 'exit';

/** Opciones que ejecutan una acción; `exit` cierra la aplicación. */
export type RunnableActionId = Exclude<MenuActionId, 'exit'>;

/** Servicios compartidos por todas las acciones de la TUI. */
export interface ActionContext {
  print: PrintFunction;
  prompt: PromptService;
  config: ConfigService;
  http: HttpClient;
  history: HistoryStore;
  ui: UiService;
}

export type ActionHandler = (context: ActionContext) => Promise<void> | void;

export type ActionHandlers = Record<RunnableActionId, ActionHandler>;
