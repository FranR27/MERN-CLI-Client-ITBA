import { createActionHandlers } from './actions/index.js';
import type { ActionContext, ActionHandlers } from './actions/types.js';
import { renderBanner } from './ui/banner.js';
import { MENU_OPTIONS, selectMenuOption, type SelectMenuOption } from './ui/menu.js';
import { theme } from './ui/theme.js';

export interface AppDependencies {
  context: ActionContext;
  selectMenu?: SelectMenuOption;
  handlers?: Partial<ActionHandlers>;
}

/**
 * Bucle principal: muestra el menú, ejecuta la acción elegida y vuelve al menú
 * hasta que el usuario selecciona "Salir".
 */
export async function runApp(dependencies: AppDependencies): Promise<void> {
  const { context } = dependencies;
  const selectMenu = dependencies.selectMenu ?? selectMenuOption;
  const print = context.print;

  const defaultHandlers = createActionHandlers();
  const handlers: ActionHandlers = {
    health: dependencies.handlers?.health ?? defaultHandlers.health,
    createGame: dependencies.handlers?.createGame ?? defaultHandlers.createGame,
    getGame: dependencies.handlers?.getGame ?? defaultHandlers.getGame,
    registerEvidence:
      dependencies.handlers?.registerEvidence ?? defaultHandlers.registerEvidence,
    validateRiddle: dependencies.handlers?.validateRiddle ?? defaultHandlers.validateRiddle,
    request: dependencies.handlers?.request ?? defaultHandlers.request,
    history: dependencies.handlers?.history ?? defaultHandlers.history,
    config: dependencies.handlers?.config ?? defaultHandlers.config,
  };

  print(renderBanner());
  print(theme.muted(`API: ${context.config.getBaseUrl()}`));
  print('');

  for (;;) {
    const action = await selectMenu(MENU_OPTIONS);

    if (action === 'exit') {
      break;
    }

    await handlers[action](context);
    print('');
  }

  print(theme.muted('Aplicación finalizada. ¡Hasta luego!'));
}
