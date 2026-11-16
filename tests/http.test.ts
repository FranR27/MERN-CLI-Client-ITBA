import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';
import {
  buildUrl,
  createHttpClient,
  normalizeRelativePath,
} from '../src/http/client.js';

type Handler = (request: IncomingMessage, response: ServerResponse) => void;

async function startServer(handler: Handler): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server = createServer(handler);

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${port}/api`,
    close: async () => {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

async function readBody(request: IncomingMessage): Promise<string> {
  let body = '';

  for await (const chunk of request) {
    body += String(chunk);
  }

  return body;
}

describe('construcción de URLs', () => {
  it('normaliza la barra inicial de la ruta', () => {
    assert.equal(normalizeRelativePath('partidas'), '/partidas');
    assert.equal(normalizeRelativePath('/partidas'), '/partidas');
    assert.throws(() => normalizeRelativePath('   '), /vacía/);
    assert.throws(() => normalizeRelativePath('https://otro.com/api'), /relativa/);
  });

  it('une la URL base sin duplicar barras', () => {
    assert.equal(buildUrl('http://localhost:3001/api/', '/health'), 'http://localhost:3001/api/health');
    assert.equal(buildUrl('http://localhost:3001/api', 'health'), 'http://localhost:3001/api/health');
    assert.throws(() => buildUrl('no-es-url', '/health'), /no es válida/);
  });
});

describe('cliente HTTP', () => {
  it('ejecuta GET y devuelve el JSON con estado y duración', async () => {
    const server = await startServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ estado: 'ok' }));
    });

    try {
      const client = createHttpClient({ getBaseUrl: () => server.baseUrl });
      const result = await client.request({ method: 'GET', path: '/health' });

      assert.equal(result.ok, true);

      if (!result.ok) {
        return;
      }

      assert.equal(result.response.status, 200);
      assert.equal(result.response.url, `${server.baseUrl}/health`);
      assert.deepEqual(result.response.body, { estado: 'ok' });
      assert.ok(result.response.durationMs >= 0);
    } finally {
      await server.close();
    }
  });

  it('envía el body JSON en POST y conserva el estado 201', async () => {
    let receivedBody = '';
    let receivedContentType = '';

    const server = await startServer(async (request, response) => {
      receivedBody = await readBody(request);
      receivedContentType = request.headers['content-type'] ?? '';
      response.writeHead(201, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ id: 'partida-1' }));
    });

    try {
      const client = createHttpClient({ getBaseUrl: () => server.baseUrl });
      const result = await client.request({
        method: 'POST',
        path: 'partidas',
        body: { capitulo: 1 },
      });

      assert.equal(result.ok, true);
      assert.equal(receivedBody, JSON.stringify({ capitulo: 1 }));
      assert.match(receivedContentType, /application\/json/);

      if (result.ok) {
        assert.equal(result.response.status, 201);
        assert.equal(result.response.statusText, 'Created');
        assert.deepEqual(result.response.body, { id: 'partida-1' });
      }
    } finally {
      await server.close();
    }
  });

  it('no lanza con errores HTTP: devuelve estado y cuerpo del error', async () => {
    const server = await startServer((_request, response) => {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(
        JSON.stringify({
          error: { codigo: 'partida_no_encontrada', mensaje: 'No existe la partida.' },
        }),
      );
    });

    try {
      const client = createHttpClient({ getBaseUrl: () => server.baseUrl });
      const result = await client.request({ method: 'GET', path: '/partidas/inexistente' });

      assert.equal(result.ok, true);

      if (result.ok) {
        assert.equal(result.response.status, 404);
        assert.deepEqual(result.response.body, {
          error: { codigo: 'partida_no_encontrada', mensaje: 'No existe la partida.' },
        });
      }
    } finally {
      await server.close();
    }
  });

  it('informa cuando la respuesta no es JSON', async () => {
    const server = await startServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end('respuesta plana');
    });

    try {
      const client = createHttpClient({ getBaseUrl: () => server.baseUrl });
      const result = await client.request({ method: 'GET', path: '/texto' });

      assert.equal(result.ok, true);

      if (result.ok) {
        assert.equal(result.response.bodyText, 'respuesta plana');
        assert.equal(result.response.body, undefined);
        assert.match(result.response.parseError ?? '', /no es JSON válido/);
      }
    } finally {
      await server.close();
    }
  });

  it('distingue un error de conexión', async () => {
    const server = await startServer((_request, response) => {
      response.end('{}');
    });
    const { baseUrl } = server;
    await server.close();

    const client = createHttpClient({ getBaseUrl: () => baseUrl, timeoutMs: 200 });
    const result = await client.request({ method: 'GET', path: '/health' });

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.failure.kind, 'connection');
      assert.match(result.failure.message, /No se pudo conectar/);
    }
  });

  it('corta la petición cuando supera el timeout', async () => {
    const server = await startServer((_request, response) => {
      setTimeout(() => {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end('{}');
      }, 500);
    });

    try {
      const client = createHttpClient({ getBaseUrl: () => server.baseUrl, timeoutMs: 50 });
      const result = await client.request({ method: 'GET', path: '/lento' });

      assert.equal(result.ok, false);

      if (!result.ok) {
        assert.equal(result.failure.kind, 'timeout');
        assert.match(result.failure.message, /tiempo máximo/);
      }
    } finally {
      await server.close();
    }
  });

  it('rechaza rutas absolutas sin hacer la petición', async () => {
    const client = createHttpClient({ getBaseUrl: () => 'http://localhost:3001/api' });
    const result = await client.request({
      method: 'GET',
      path: 'http://otro-sitio.com/health',
    });

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.failure.kind, 'invalid-request');
      assert.match(result.failure.message, /relativa/);
    }
  });
});
