import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { MenuActionId } from '../src/actions/types.js';
import { runApp } from '../src/app.js';

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
    const calls: string[] = [];
    const printed: string[] = [];

    await runApp({
      selectMenu: createSelectSequence(['health', 'validateRiddle', 'exit']),
      handlers: {
        health: () => {
          calls.push('health');
        },
        validateRiddle: () => {
          calls.push('validateRiddle');
        },
      },
      print: (message) => printed.push(message),
    });

    assert.deepEqual(calls, ['health', 'validateRiddle']);
    assert.match(printed.join('\n'), /CASO 404/);
    assert.match(printed.join('\n'), /Sesión finalizada/);
  });

  it('no ejecuta acciones al elegir Salir como primera opción', async () => {
    const calls: string[] = [];
    const printed: string[] = [];

    await runApp({
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
      print: (message) => printed.push(message),
    });

    assert.deepEqual(calls, []);
    assert.match(printed.join('\n'), /Hasta luego/);
  });

  it('usa los handlers por defecto cuando no se inyectan', async () => {
    const printed: string[] = [];

    await runApp({
      selectMenu: createSelectSequence(['request', 'exit']),
      print: (message) => printed.push(message),
    });

    assert.match(printed.join('\n'), /próxima etapa/);
    assert.match(printed.join('\n'), /RF-08/);
  });

  it('propaga los errores de una acción para que no se oculten', async () => {
    await assert.rejects(
      runApp({
        selectMenu: createSelectSequence(['health', 'exit']),
        handlers: {
          health: () => {
            throw new Error('falló la acción');
          },
        },
        print: () => undefined,
      }),
      /falló la acción/,
    );
  });
});
