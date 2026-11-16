import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isHttpMethod, type HttpMethod } from '../http/types.js';
import { isRecord } from '../utils/types.js';

export const HISTORY_FILE_NAME = '.mern-cli-history.json';
export const HISTORY_LIMIT = 10;

export interface HistoryEntry {
  method: HttpMethod;
  path: string;
  status: number;
  durationMs: number;
  timestamp: string;
}

export interface HistoryStore {
  readonly filePath: string;
  list(): HistoryEntry[];
  add(entry: HistoryEntry): void;
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    isRecord(value) &&
    isHttpMethod(value.method) &&
    typeof value.path === 'string' &&
    typeof value.status === 'number' &&
    typeof value.durationMs === 'number' &&
    typeof value.timestamp === 'string'
  );
}

export function createHistoryStore(
  directory = process.cwd(),
  limit = HISTORY_LIMIT,
): HistoryStore {
  const filePath = resolve(directory, HISTORY_FILE_NAME);
  let entries = loadEntries();

  function loadEntries(): HistoryEntry[] {
    try {
      const parsed: unknown = JSON.parse(readFileSync(filePath, 'utf8'));

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(isHistoryEntry).slice(0, limit);
    } catch {
      return [];
    }
  }

  function persist(): void {
    writeFileSync(filePath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
  }

  return {
    filePath,

    list(): HistoryEntry[] {
      return entries.map((entry) => ({ ...entry }));
    },

    add(entry: HistoryEntry): void {
      entries = [entry, ...entries].slice(0, limit);
      persist();
    },
  };
}
