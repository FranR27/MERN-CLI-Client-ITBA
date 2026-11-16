import { executeRequest } from './shared.js';
import type { ActionContext } from './types.js';
import { validateRequired } from './validators.js';

/** RF-06: registra una evidencia encontrada en una partida. */
export async function runRegisterEvidence(context: ActionContext): Promise<void> {
  const gameId = (
    await context.prompt.input({
      message: 'ID de partida',
      validate: (value) => validateRequired(value, 'El ID de partida'),
    })
  ).trim();

  const evidenceId = (
    await context.prompt.input({
      message: 'ID de evidencia (por ejemplo ev_credencial)',
      validate: (value) => validateRequired(value, 'El ID de evidencia'),
    })
  ).trim();

  await executeRequest(context, {
    method: 'POST',
    path: `/partidas/${encodeURIComponent(gameId)}/evidencias`,
    body: { evidenciaId: evidenceId },
    label: 'Registrando evidencia…',
  });
}
