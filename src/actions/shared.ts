import { normalizeRelativePath } from '../http/client.js';
import type { HttpMethod, HttpResponseData } from '../http/types.js';
import { theme } from '../ui/theme.js';
import type { ActionContext } from './types.js';

export interface ExecuteRequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  label?: string;
}

/**
 * Ejecuta una petición, muestra la respuesta o el error y registra la entrada
 * en el historial cuando hubo una respuesta HTTP.
 */
export async function executeRequest(
  context: ActionContext,
  options: ExecuteRequestOptions,
): Promise<HttpResponseData | undefined> {
  const path = normalizeRelativePath(options.path);
  const result = await context.ui.runWithSpinner(
    options.label ?? 'Enviando petición…',
    () =>
      context.http.request({
        method: options.method,
        path,
        body: options.body,
      }),
  );

  if (!result.ok) {
    context.ui.showFailure(result.failure);
    return undefined;
  }

  context.ui.showResponse(result.response);

  try {
    context.history.add({
      method: options.method,
      path,
      status: result.response.status,
      durationMs: result.response.durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'error desconocido';
    context.print(theme.warning(`No se pudo guardar el historial: ${detail}`));
  }

  return result.response;
}
