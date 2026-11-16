import type { HistoryEntry } from '../history/history.js';
import { theme } from '../ui/theme.js';
import { executeRequest } from './shared.js';
import type { ActionContext } from './types.js';
import { validateJsonInput } from './validators.js';

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString('es-AR');
}

/** RF-10: muestra las últimas peticiones y permite repetir una. */
export async function runHistory(context: ActionContext): Promise<void> {
  const entries = context.history.list();

  if (entries.length === 0) {
    context.print(theme.muted('Todavía no hay peticiones registradas.'));
    return;
  }

  const selected = await context.prompt.select<string>({
    message: 'Seleccioná una petición para repetirla',
    choices: [
      ...entries.map((entry, index) => ({
        value: String(index),
        name: `${index + 1}. ${entry.method} ${entry.path}`,
        description: `${entry.status} · ${entry.durationMs} ms · ${formatDate(entry.timestamp)}`,
      })),
      { value: 'back', name: 'Volver al menú', description: 'No repetir ninguna petición' },
    ],
  });

  if (selected === 'back') {
    return;
  }

  const entry: HistoryEntry | undefined = entries[Number(selected)];

  if (!entry) {
    context.print(theme.warning('No se pudo encontrar la entrada seleccionada.'));
    return;
  }

  let body: unknown;

  if (entry.method === 'POST' || entry.method === 'PUT') {
    context.print(
      theme.muted('El body no se guarda por seguridad; ingresalo de nuevo para repetir la petición.'),
    );

    const bodyInput = await context.prompt.input({
      message: 'Body JSON (vacío para omitir)',
      validate: validateJsonInput,
    });

    if (bodyInput.trim()) {
      body = JSON.parse(bodyInput);
    }
  }

  await executeRequest(context, {
    method: entry.method,
    path: entry.path,
    body,
    label: `Repitiendo ${entry.method} ${entry.path}…`,
  });
}
