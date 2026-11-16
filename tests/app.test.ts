import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { MenuActionId } from '../src/actions/types.js';
import { runApp } from '../src/app.js';
import { createFakeContext, okResponse } from './helpers.js';

function createSelectSequence(sequence: MenuActionId[]) {
  let index = 0;

  return async (): Promise<MenuActionId> => {
    const action = sequence[index];
    index += 1;
    assert.ok(action, 'La aplicación pidió más selecciones de las esperadas');
    return action;
  };
}

describe('bucle principal de la aplicación', () => {
  it('ejecuta la acción elegida y vuelve al menú hasta elegir Salir', async () => {
    const fake = createFakeContext();
    const calls: string[] = [];

    await runApp({
      context: fake.context,
      selectMenu: createSelectSequence(['health', 'validateRiddle', 'exit']),
      handlers: {
        health: () => {
          calls.push('health');
        },
        validateRiddle: () => {
          calls.push('validateRiddle');
        },
      },
    });

    const output = fake.printed.join('\n');
    assert.deepEqual(calls, ['health', 'validateRiddle']);
    assert.match(output, /CASO 404/);
    assert.match(output, /API: http:\/\/localhost:3001\/api/);
    assert.match(output, /Aplicación finalizada/);
  });

  it('no ejecuta acciones al elegir Salir como primera opción', async () => {
    const fake = createFakeContext();
    const calls: string[] = [];

    await runApp({
      context: fake.context,
      selectMenu: createSelectSequence(['exit']),
      handlers: {
        health: () => {
          calls.push('health');
        },
        createGame: () => {
          calls.push('createGame');
        },
        getGame: () => {
          calls.push('getGame');
        },
        registerEvidence: () => {
          calls.push('registerEvidence');
        },
        validateRiddle: () => {
          calls.push('validateRiddle');
        },
        request: () => {
          calls.push('request');
        },
        history: () => {
          calls.push('history');
        },
        config: () => {
          calls.push('config');
        },
      },
    });

    assert.deepEqual(calls, []);
    assert.match(fake.printed.join('\n'), /Hasta luego/);
  });

  it('usa las acciones reales cuando no se inyectan handlers', async () => {
    const fake = createFakeContext({
      selects: ['GET'],
      inputs: ['/health'],
      results: [okResponse()],
    });

    await runApp({
      context: fake.context,
      selectMenu: createSelectSequence(['request', 'exit']),
    });

    assert.equal(fake.requests[0]?.method, 'GET');
    assert.equal(fake.requests[0]?.path, '/health');
  });

  it('propaga los errores de una acción para que no se oculten', async () => {
    const fake = createFakeContext();

    await assert.rejects(
      runApp({
        context: fake.context,
        selectMenu: createSelectSequence(['health', 'exit']),
        handlers: {
          health: () => {
            throw new Error('falló la acción');
          },
        },
      }),
      /falló la acción/,
    );
  });
});
