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

/**
 * Dependencias disponibles para las acciones.
 * En las próximas etapas se ampliará con configuración, cliente HTTP e historial.
 */
export interface ActionContext {
  print: (message: string) => void;
}

export type ActionHandler = (context: ActionContext) => Promise<void> | void;

export type ActionHandlers = Record<RunnableActionId, ActionHandler>;
