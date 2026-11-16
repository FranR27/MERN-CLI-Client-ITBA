import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runConfigureBaseUrl } from '../src/actions/config.js';
import { runRegisterEvidence } from '../src/actions/evidence.js';
import { runCreateGame, runGetGame } from '../src/actions/games.js';
import { runHealthCheck } from '../src/actions/health.js';
import { runHistory } from '../src/actions/history.js';
import { runCustomRequest } from '../src/actions/request.js';
import { runValidateRiddle } from '../src/actions/riddle.js';
import { executeRequest } from '../src/actions/shared.js';
import { createFakeContext, failedRequest, okResponse, stripAnsi } from './helpers.js';

describe('ejecución compartida de peticiones', () => {
  it('registra en el historial cuando hubo respuesta HTTP', async () => {
    const fake = createFakeContext({ results: [okResponse()] });

    const response = await executeRequest(fake.context, { method: 'GET', path: 'health' });

    assert.equal(response?.status, 200);
    assert.equal(fake.requests[0]?.path, '/health');
    assert.equal(fake.responses.length, 1);
    assert.equal(fake.historyEntries[0]?.method, 'GET');
    assert.equal(fake.historyEntries[0]?.path, '/health');
    assert.equal(fake.historyEntries[0]?.status, 200);
  });

  it('no registra en el historial cuando falla la conexión', async () => {
    const fake = createFakeContext({ results: [failedRequest()] });

    const response = await executeRequest(fake.context, { method: 'GET', path: '/health' });

    assert.equal(response, undefined);
    assert.equal(fake.historyEntries.length, 0);
    assert.equal(fake.failures.length, 1);
  });
});

describe('acción de comprobación de conexión', () => {
  it('confirma la conexión cuando /health responde ok', async () => {
    const fake = createFakeContext({
      results: [okResponse({ body: { estado: 'ok', servicio: 'caso404-backend' } })],
    });

    await runHealthCheck(fake.context);

    assert.equal(fake.requests[0]?.method, 'GET');
    assert.equal(fake.requests[0]?.path, '/health');
    assert.match(fake.printed.join('\n'), /Conexión correcta con la API/);
  });
});

describe('acciones de partidas', () => {
  it('crea una partida con capítulo 1 por defecto y muestra su ID', async () => {
    const fake = createFakeContext({
      inputs: ['1'],
      results: [
        okResponse({
          method: 'POST',
          status: 201,
          statusText: 'Created',
          body: { id: 'abc123', capitulo: 1 },
        }),
      ],
    });

    await runCreateGame(fake.context);

    assert.deepEqual(fake.requests[0], {
      method: 'POST',
      path: '/partidas',
      body: { capitulo: 1 },
    });
    assert.match(fake.printed.join('\n'), /ID de partida: abc123/);
  });

  it('permite omitir el body al crear una partida', async () => {
    const fake = createFakeContext({
      inputs: ['omitir'],
      results: [okResponse({ method: 'POST', status: 201, body: { id: 'abc' } })],
    });

    await runCreateGame(fake.context);

    assert.equal(fake.requests[0]?.body, undefined);
  });

  it('codifica el ID al consultar una partida', async () => {
    const fake = createFakeContext({
      inputs: ['partida 1'],
      results: [okResponse({ body: { id: 'partida 1' } })],
    });

    await runGetGame(fake.context);

    assert.equal(fake.requests[0]?.path, '/partidas/partida%201');
  });
});

describe('acción de registro de evidencia', () => {
  it('envía el body con evidenciaId', async () => {
    const fake = createFakeContext({
      inputs: ['partida-1', 'ev_credencial'],
      results: [okResponse({ method: 'POST' })],
    });

    await runRegisterEvidence(fake.context);

    assert.deepEqual(fake.requests[0], {
      method: 'POST',
      path: '/partidas/partida-1/evidencias',
      body: { evidenciaId: 'ev_credencial' },
    });
  });
});

describe('acción de validación de acertijo', () => {
  it('distingue una respuesta incorrecta de un error HTTP', async () => {
    const fake = createFakeContext({
      inputs: ['partida-1', 'p1_despedida', 'respuesta-elegida'],
      results: [
        okResponse({
          method: 'POST',
          body: {
            correcto: false,
            yaResuelto: false,
            evidenciasDesbloqueadas: [],
            partida: { id: 'partida-1' },
          },
        }),
      ],
    });

    await runValidateRiddle(fake.context);

    const output = fake.printed.join('\n');
    assert.match(output, /no es correcta \(no es un error HTTP\)/);
    assert.match(output, /Evidencias desbloqueadas: ninguna/);
    assert.doesNotMatch(output, /respuesta-elegida/);
  });

  it('muestra las evidencias desbloqueadas cuando la respuesta es correcta', async () => {
    const fake = createFakeContext({
      inputs: ['partida-1', 'p1_despedida', 'correcta'],
      results: [
        okResponse({
          method: 'POST',
          body: {
            correcto: true,
            yaResuelto: false,
            evidenciasDesbloqueadas: ['ev_metadatos', 'ev_nota_caja'],
          },
        }),
      ],
    });

    await runValidateRiddle(fake.context);

    const output = fake.printed.join('\n');
    assert.match(output, /respuesta correcta/);
    assert.match(output, /ev_metadatos, ev_nota_caja/);
    assert.match(output, /Ya estaba resuelto: no/);
  });
});

describe('constructor REST personalizado', () => {
  it('envía POST con el body JSON ingresado', async () => {
    const fake = createFakeContext({
      selects: ['POST'],
      inputs: ['/partidas', '{"capitulo": 2}'],
      results: [okResponse({ method: 'POST', status: 201, statusText: 'Created' })],
    });

    await runCustomRequest(fake.context);

    assert.equal(fake.requests[0]?.method, 'POST');
    assert.equal(fake.requests[0]?.path, '/partidas');
    assert.deepEqual(fake.requests[0]?.body, { capitulo: 2 });
  });

  it('envía GET sin body', async () => {
    const fake = createFakeContext({
      selects: ['GET'],
      inputs: ['/health'],
      results: [okResponse()],
    });

    await runCustomRequest(fake.context);

    assert.equal(fake.requests[0]?.body, undefined);
  });
});

describe('acción de historial', () => {
  it('avisa cuando todavía no hay peticiones', async () => {
    const fake = createFakeContext();

    await runHistory(fake.context);

    assert.match(fake.printed.join('\n'), /Todavía no hay peticiones/);
  });

  it('repite una petición GET seleccionada', async () => {
    const fake = createFakeContext({
      history: [
        {
          method: 'GET',
          path: '/health',
          status: 200,
          durationMs: 15,
          timestamp: '2026-11-16T12:00:00.000Z',
        },
      ],
      selects: ['0'],
      results: [okResponse()],
    });

    await runHistory(fake.context);

    assert.equal(fake.requests[0]?.method, 'GET');
    assert.equal(fake.requests[0]?.path, '/health');
  });

  it('pide el body de nuevo al repetir un POST', async () => {
    const fake = createFakeContext({
      history: [
        {
          method: 'POST',
          path: '/partidas',
          status: 201,
          durationMs: 20,
          timestamp: '2026-11-16T12:00:00.000Z',
        },
      ],
      selects: ['0'],
      inputs: ['{"capitulo": 1}'],
      results: [okResponse({ method: 'POST', status: 201 })],
    });

    await runHistory(fake.context);

    assert.match(fake.printed.join('\n'), /no se guarda por seguridad/);
    assert.deepEqual(fake.requests[0]?.body, { capitulo: 1 });
  });
});

describe('acción de configuración', () => {
  it('muestra la URL actual y guarda la nueva', async () => {
    const updated: string[] = [];
    const fake = createFakeContext({
      inputs: ['http://localhost:4000/api'],
      onSetBaseUrl: (value) => updated.push(value),
    });

    await runConfigureBaseUrl(fake.context);

    const output = stripAnsi(fake.printed.join('\n'));
    assert.match(output, /URL base actual: http:\/\/localhost:3001\/api/);
    assert.deepEqual(updated, ['http://localhost:4000/api']);
    assert.match(output, /URL base actualizada/);
  });
});
