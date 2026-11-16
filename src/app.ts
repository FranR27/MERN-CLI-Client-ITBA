import { createActionHandlers } from './actions/index.js';
import type { ActionContext, ActionHandlers } from './actions/types.js';
import { renderBanner } from './ui/banner.js';
import { MENU_OPTIONS, selectMenuOption, type SelectMenuOption } from './ui/menu.js';
import { theme } from './ui/theme.js';

export interface AppDependencies {
  selectMenu?: SelectMenuOption;
  handlers?: Partial<ActionHandlers>;
  print?: ActionContext['print'];
}

/**
 * Bucle principal: muestra el menú, ejecuta la acción elegida y vuelve al menú
 * hasta que el usuario selecciona "Salir".
 */
export async function runApp(dependencies: AppDependencies = {}): Promise<void> {
  const selectMenu = dependencies.selectMenu ?? selectMenuOption;
  const print = dependencies.print ?? ((message: string) => console.log(message));

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
  print('');

  for (;;) {
    const action = await selectMenu(MENU_OPTIONS);

    if (action === 'exit') {
      break;
    }

    await handlers[action]({ print });
    print('');
  }

  print(theme.muted('Sesión finalizada. ¡Hasta luego!'));
}
