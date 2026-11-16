import type { HttpMethod } from '../http/types.js';
import { executeRequest } from './shared.js';
import type { ActionContext } from './types.js';
import { validateJsonInput, validateRelativePathInput } from './validators.js';

/** RF-08: constructor REST personalizado con GET, POST, PUT y DELETE. */
export async function runCustomRequest(context: ActionContext): Promise<void> {
  const method = await context.prompt.select<HttpMethod>({
    message: 'Método HTTP',
    choices: [
      { value: 'GET', name: 'GET', description: 'Consultar un recurso' },
      { value: 'POST', name: 'POST', description: 'Crear un recurso' },
      { value: 'PUT', name: 'PUT', description: 'Reemplazar un recurso' },
      { value: 'DELETE', name: 'DELETE', description: 'Eliminar un recurso' },
    ],
  });

  const path = await context.prompt.input({
    message: 'Ruta relativa a la URL base (por ejemplo /partidas/ID)',
    validate: validateRelativePathInput,
  });

  let body: unknown;

  if (method === 'POST' || method === 'PUT') {
    const bodyInput = await context.prompt.input({
      message: 'Body JSON (vacío para omitir)',
      validate: validateJsonInput,
    });

    if (bodyInput.trim()) {
      body = JSON.parse(bodyInput);
    }
  }

  await executeRequest(context, {
    method,
    path,
    body,
    label: `Enviando ${method} ${path.trim()}…`,
  });
}
