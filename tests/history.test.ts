import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  HISTORY_FILE_NAME,
  HISTORY_LIMIT,
  createHistoryStore,
  type HistoryEntry,
} from '../src/history/history.js';

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'mern-cli-history-'));
}

function entry(index: number): HistoryEntry {
  return {
    method: 'GET',
    path: `/recurso/${index}`,
    status: 200,
    durationMs: index,
    timestamp: new Date(2026, 0, index + 1).toISOString(),
  };
}

describe('historial de peticiones', () => {
  it('guarda como máximo 10 entradas y ordena la más reciente primero', () => {
    const directory = createTempDir();

    try {
      const history = createHistoryStore(directory);

      for (let index = 0; index < 12; index += 1) {
        history.add(entry(index));
      }

      const entries = history.list();
      assert.equal(entries.length, HISTORY_LIMIT);
      assert.equal(entries[0]?.path, '/recurso/11');
      assert.equal(entries.at(-1)?.path, '/recurso/2');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('persiste las entradas y las recupera en otra instancia', () => {
    const directory = createTempDir();

    try {
      createHistoryStore(directory).add(entry(1));

      const reloaded = createHistoryStore(directory);
      assert.equal(reloaded.list().length, 1);
      assert.equal(reloaded.list()[0]?.path, '/recurso/1');
      assert.equal(reloaded.filePath, join(directory, HISTORY_FILE_NAME));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('ignora archivos corruptos y entradas inválidas', () => {
    const directory = createTempDir();

    try {
      const history = createHistoryStore(directory);

      writeFileSync(history.filePath, '{ roto', 'utf8');
      assert.deepEqual(createHistoryStore(directory).list(), []);

      writeFileSync(
        history.filePath,
        JSON.stringify([{ method: 'GET' }, entry(2)]),
        'utf8',
      );
      assert.equal(createHistoryStore(directory).list().length, 1);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('devuelve copias para no exponer su estado interno', () => {
    const directory = createTempDir();

    try {
      const history = createHistoryStore(directory);
      history.add(entry(1));

      const copy = history.list();
      copy[0]!.status = 500;

      assert.equal(history.list()[0]?.status, 200);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
