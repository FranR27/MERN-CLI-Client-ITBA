import { isRecord } from '../utils/types.js';
import { symbols, theme } from '../ui/theme.js';
import { executeRequest } from './shared.js';
import type { ActionContext } from './types.js';

/** RF-03: comprueba la conexión con el backend mediante GET /health. */
export async function runHealthCheck(context: ActionContext): Promise<void> {
  const response = await executeRequest(context, {
    method: 'GET',
    path: '/health',
    label: 'Comprobando conexión con la API…',
  });

  if (!response) {
    return;
  }

  if (response.status >= 200 && response.status < 300) {
    const estado = isRecord(response.body) ? response.body.estado : undefined;

    context.print(
      estado === 'ok'
        ? theme.success(`${symbols.success} Conexión correcta con la API.`)
        : theme.warning('La API respondió, pero no informó un estado "ok".'),
    );
    return;
  }

  context.print(theme.warning('La API respondió con un error HTTP. Revisá el detalle anterior.'));
}
