import { isRecord } from '../utils/types.js';
import { symbols, theme } from '../ui/theme.js';
import { executeRequest } from './shared.js';
import type { ActionContext } from './types.js';
import {
  parseChapterInput,
  validateChapterInput,
  validateRequired,
} from './validators.js';

/** RF-04: crea una partida con body opcional. */
export async function runCreateGame(context: ActionContext): Promise<void> {
  const chapterInput = await context.prompt.input({
    message: 'Capítulo (Enter = 1, "omitir" para no enviar body)',
    default: '1',
    validate: validateChapterInput,
  });
  const chapter = parseChapterInput(chapterInput);

  const response = await executeRequest(context, {
    method: 'POST',
    path: '/partidas',
    ...(chapter !== undefined ? { body: { capitulo: chapter } } : {}),
    label: 'Creando partida…',
  });

  if (!response || response.status < 200 || response.status >= 300) {
    return;
  }

  const id = isRecord(response.body) ? response.body.id : undefined;

  if (typeof id === 'string' && id) {
    context.print(theme.success(`${symbols.success} ID de partida: ${id}`));
    context.print(
      theme.muted('Guardá este ID para consultar la partida o registrar evidencias.'),
    );
  } else {
    context.print(theme.warning('La respuesta no incluyó un ID de partida.'));
  }
}

/** RF-05: consulta una partida por ID. */
export async function runGetGame(context: ActionContext): Promise<void> {
  const id = (
    await context.prompt.input({
      message: 'ID de partida',
      validate: (value) => validateRequired(value, 'El ID de partida'),
    })
  ).trim();

  await executeRequest(context, {
    method: 'GET',
    path: `/partidas/${encodeURIComponent(id)}`,
    label: 'Consultando partida…',
  });
}
