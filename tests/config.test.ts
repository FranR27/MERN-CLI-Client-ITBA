import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  CONFIG_FILE_NAME,
  createConfigService,
  createConfigStore,
  normalizeBaseUrl,
  validateBaseUrl,
} from '../src/config/config.js';

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'mern-cli-config-'));
}

describe('validación de la URL base', () => {
  it('normaliza y quita la barra final', () => {
    assert.equal(normalizeBaseUrl('http://localhost:3001/api/'), 'http://localhost:3001/api');
    assert.equal(normalizeBaseUrl('  https://api.ejemplo.com  '), 'https://api.ejemplo.com');
  });

  it('rechaza valores inválidos', () => {
    assert.throws(() => normalizeBaseUrl(''), /vacía/);
    assert.throws(() => normalizeBaseUrl('localhost:3001/api'), /http o https/);
    assert.throws(() => normalizeBaseUrl('ftp://localhost/api'), /http o https/);
    assert.throws(() => normalizeBaseUrl('http://localhost/api?x=1'), /query string/);
  });

  it('devuelve true o un mensaje de error para los prompts', () => {
    assert.equal(validateBaseUrl('http://localhost:3001/api'), true);
    assert.equal(typeof validateBaseUrl('no-es-una-url'), 'string');
  });
});

describe('almacenamiento de configuración', () => {
  it('informa cuando el archivo no existe', () => {
    const directory = createTempDir();

    try {
      const store = createConfigStore(directory);
      assert.deepEqual(store.load(), { status: 'missing' });
      assert.equal(store.filePath, join(directory, CONFIG_FILE_NAME));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('guarda y vuelve a cargar la URL base', () => {
    const directory = createTempDir();

    try {
      const store = createConfigStore(directory);
      store.save({ baseUrl: 'http://localhost:3001/api' });

      assert.deepEqual(store.load(), {
        status: 'loaded',
        config: { baseUrl: 'http://localhost:3001/api' },
      });
      assert.match(readFileSync(store.filePath, 'utf8'), /http:\/\/localhost:3001\/api/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('detecta JSON mal formado y campos faltantes', () => {
    const directory = createTempDir();

    try {
      const store = createConfigStore(directory);

      writeFileSync(store.filePath, '{ roto', 'utf8');
      assert.equal(store.load().status, 'invalid');

      writeFileSync(store.filePath, '{"otro": 1}', 'utf8');
      assert.equal(store.load().status, 'invalid');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('actualiza la URL en memoria y en disco', () => {
    const directory = createTempDir();

    try {
      const store = createConfigStore(directory);
      const service = createConfigService(store, { baseUrl: 'http://localhost:3001/api' });

      const updated = service.setBaseUrl('http://localhost:4000/api/');

      assert.equal(updated.baseUrl, 'http://localhost:4000/api');
      assert.equal(service.getBaseUrl(), 'http://localhost:4000/api');
      assert.deepEqual(store.load(), {
        status: 'loaded',
        config: { baseUrl: 'http://localhost:4000/api' },
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
