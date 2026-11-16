import { isRecord } from '../utils/types.js';
import { theme } from '../ui/theme.js';
import { executeRequest } from './shared.js';
import type { ActionContext } from './types.js';
import { validateRequired, validateRiddleAnswer } from './validators.js';

/** RF-07: valida la respuesta de un acertijo y resume el resultado de negocio. */
export async function runValidateRiddle(context: ActionContext): Promise<void> {
  const gameId = (
    await context.prompt.input({
      message: 'ID de partida',
      validate: (value) => validateRequired(value, 'El ID de partida'),
    })
  ).trim();

  const riddleId = (
    await context.prompt.input({
      message: 'ID de acertijo (por ejemplo p1_despedida)',
      validate: (value) => validateRequired(value, 'El ID de acertijo'),
    })
  ).trim();

  const answer = await context.prompt.input({
    message: 'Respuesta',
    validate: validateRiddleAnswer,
  });

  const response = await executeRequest(context, {
    method: 'POST',
    path: `/partidas/${encodeURIComponent(gameId)}/acertijos/${encodeURIComponent(riddleId)}/validar`,
    body: { respuesta: answer },
    label: 'Validando respuesta…',
  });

  if (!response || !isRecord(response.body) || typeof response.body.correcto !== 'boolean') {
    return;
  }

  const { correcto, yaResuelto, evidenciasDesbloqueadas } = response.body;

  context.print(
    correcto
      ? theme.success('Resultado: respuesta correcta.')
      : theme.warning('Resultado: la respuesta no es correcta (no es un error HTTP).'),
  );

  if (typeof yaResuelto === 'boolean') {
    context.print(`Ya estaba resuelto: ${yaResuelto ? 'sí' : 'no'}`);
  }

  if (Array.isArray(evidenciasDesbloqueadas)) {
    const evidencias = evidenciasDesbloqueadas.filter(
      (item): item is string => typeof item === 'string',
    );
    context.print(
      `Evidencias desbloqueadas: ${evidencias.length > 0 ? evidencias.join(', ') : 'ninguna'}`,
    );
  }
}
