import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatFailure, formatResponse, highlightJson } from '../src/ui/response.js';
import { makeResponse, stripAnsi } from './helpers.js';

describe('formato de respuestas', () => {
  it('muestra método, URL, estado, duración y JSON indentado', () => {
    const text = stripAnsi(
      formatResponse(
        makeResponse({
          status: 201,
          statusText: 'Created',
          body: { id: 'abc' },
          bodyText: '{"id":"abc"}',
        }),
      ),
    );

    assert.match(text, /GET http:\/\/localhost:3001\/api\/health/);
    assert.match(text, /201 Created/);
    assert.match(text, /12 ms/);
    assert.match(text, /"id": "abc"/);
  });

  it('muestra el mensaje de error del backend', () => {
    const body = {
      error: { codigo: 'evidencia_bloqueada', mensaje: 'Esa evidencia todavía está bloqueada.' },
    };
    const text = stripAnsi(
      formatResponse(makeResponse({ status: 403, statusText: 'Forbidden', body })),
    );

    assert.match(text, /Esa evidencia todavía está bloqueada\./);
    assert.match(text, /evidencia_bloqueada/);
  });

  it('muestra el texto recibido cuando no es JSON', () => {
    const text = stripAnsi(
      formatResponse(
        makeResponse({
          status: 200,
          bodyText: 'texto plano',
          parseError: 'La respuesta no es JSON válido.',
        }),
      ),
    );

    assert.match(text, /no es JSON válido/);
    assert.match(text, /texto plano/);
  });

  it('indica cuando la respuesta está vacía', () => {
    const text = stripAnsi(formatResponse(makeResponse({ bodyText: '', body: undefined })));

    assert.match(text, /sin contenido/);
  });

  it('resalta JSON sin alterar su contenido visible', () => {
    const json = JSON.stringify(
      { texto: 'hola', numero: 42, activo: true, nulo: null, lista: [1, 2] },
      null,
      2,
    );

    assert.equal(stripAnsi(highlightJson(json)), json);
  });

  it('formatea errores de conexión con detalle y URL', () => {
    const text = stripAnsi(
      formatFailure({
        kind: 'connection',
        method: 'GET',
        url: 'http://localhost:3001/api/health',
        durationMs: 30,
        message: 'No se pudo conectar con la API.',
        detail: 'fetch failed: connect ECONNREFUSED',
      }),
    );

    assert.match(text, /No se pudo conectar/);
    assert.match(text, /ECONNREFUSED/);
    assert.match(text, /http:\/\/localhost:3001\/api\/health/);
  });
});
