import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { createConfigStore } from '../src/config/config.js';
import { resolveConfig } from '../src/startup.js';
import type { PromptService } from '../src/ui/prompts.js';

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'mern-cli-startup-'));
}

function promptWithAnswer(answer: string): PromptService {
  return {
    input: async () => answer,
    select: async () => {
      throw new Error('select no esperado');
    },
    confirm: async () => {
      throw new Error('confirm no esperado');
    },
  };
}

function unusedPrompt(): PromptService {
  return {
    input: async () => {
      throw new Error('no se debía pedir la URL');
    },
    select: async () => {
      throw new Error('select no esperado');
    },
    confirm: async () => {
      throw new Error('confirm no esperado');
    },
  };
}

describe('inicio de la aplicación', () => {
  it('pide y guarda la URL base cuando no existe configuración', async () => {
    const directory = createTempDir();

    try {
      const printed: string[] = [];
      const { config, store } = await resolveConfig({
        directory,
        prompt: promptWithAnswer('http://localhost:4000/api/'),
        print: (message) => printed.push(message),
      });

      assert.deepEqual(config, { baseUrl: 'http://localhost:4000/api' });
      assert.deepEqual(store.load(), {
        status: 'loaded',
        config: { baseUrl: 'http://localhost:4000/api' },
      });
      assert.match(printed.join('\n'), /Configuración guardada/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('usa la configuración existente sin preguntar', async () => {
    const directory = createTempDir();

    try {
      const store = createConfigStore(directory);
      store.save({ baseUrl: 'http://localhost:5000/api' });

      const { config } = await resolveConfig({
        directory,
        prompt: unusedPrompt(),
        print: () => undefined,
      });

      assert.deepEqual(config, { baseUrl: 'http://localhost:5000/api' });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('avisa si el archivo es inválido y vuelve a pedir la URL', async () => {
    const directory = createTempDir();

    try {
      const store = createConfigStore(directory);
      writeFileSync(store.filePath, '{ roto', 'utf8');
      const printed: string[] = [];

      const { config } = await resolveConfig({
        directory,
        prompt: promptWithAnswer('http://localhost:3001/api'),
        print: (message) => printed.push(message),
      });

      assert.match(printed.join('\n'), /No se pudo usar \.mern-cli\.json/);
      assert.deepEqual(config, { baseUrl: 'http://localhost:3001/api' });
      assert.equal(store.load().status, 'loaded');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
