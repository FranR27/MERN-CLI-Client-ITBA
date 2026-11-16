import { symbols, theme } from '../ui/theme.js';
import { validateBaseUrl } from '../config/config.js';
import type { ActionContext } from './types.js';

/** RF-01: muestra y permite modificar la URL base. */
export async function runConfigureBaseUrl(context: ActionContext): Promise<void> {
  const current = context.config.getBaseUrl();

  context.print(`URL base actual: ${theme.accent(current)}`);
  context.print(theme.muted(`Archivo de configuración: ${context.config.filePath}`));

  const value = await context.prompt.input({
    message: 'Nueva URL base (Enter para conservar la actual)',
    default: current,
    validate: validateBaseUrl,
  });

  try {
    const config = context.config.setBaseUrl(value);
    context.print(theme.success(`${symbols.success} URL base actualizada: ${config.baseUrl}`));
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'error desconocido';
    context.print(theme.danger(`No se pudo guardar la configuración: ${detail}`));
  }
}
