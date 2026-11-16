import { symbols, theme } from '../ui/theme.js';
import type { ActionHandler } from './types.js';

/**
 * Acción temporal para las funcionalidades que se implementarán en etapas posteriores.
 * Evita simular comportamiento que todavía no existe.
 */
export function createPlaceholderAction(title: string, requirement: string): ActionHandler {
  return ({ print }) => {
    print('');
    print(`${symbols.pending} ${theme.accent(title)}`);
    print(theme.muted(`Pendiente: se implementará en una próxima etapa (${requirement}).`));
  };
}
