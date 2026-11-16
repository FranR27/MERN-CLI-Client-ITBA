import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isRecord } from '../utils/types.js';

export const DEFAULT_BASE_URL = 'http://localhost:3001/api';
export const CONFIG_FILE_NAME = '.mern-cli.json';

export interface AppConfig {
  baseUrl: string;
}

export type ConfigLoadResult =
  | { status: 'loaded'; config: AppConfig }
  | { status: 'missing' }
  | { status: 'invalid'; reason: string };

export interface ConfigStore {
  readonly filePath: string;
  load(): ConfigLoadResult;
  save(config: AppConfig): void;
}

export interface ConfigService {
  readonly filePath: string;
  getBaseUrl(): string;
  setBaseUrl(input: string): AppConfig;
}

/** Valida y normaliza la URL base, quitando la barra final. */
export function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error('La URL base no puede estar vacía.');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Ingresá una URL válida, por ejemplo http://localhost:3001/api.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('La URL base debe usar el protocolo http o https.');
  }

  if (parsed.search || parsed.hash) {
    throw new Error('La URL base no debe incluir query string ni fragmento.');
  }

  return trimmed.replace(/\/+$/, '');
}

/** Validador para los prompts: devuelve true o el mensaje de error. */
export function validateBaseUrl(input: string): true | string {
  try {
    normalizeBaseUrl(input);
    return true;
  } catch (error) {
    return error instanceof Error ? error.message : 'La URL base no es válida.';
  }
}

export function createConfigStore(directory = process.cwd()): ConfigStore {
  const filePath = resolve(directory, CONFIG_FILE_NAME);

  return {
    filePath,

    load(): ConfigLoadResult {
      let raw: string;

      try {
        raw = readFileSync(filePath, 'utf8');
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        return code === 'ENOENT'
          ? { status: 'missing' }
          : { status: 'invalid', reason: 'no se pudo leer el archivo' };
      }

      try {
        const data: unknown = JSON.parse(raw);

        if (!isRecord(data) || typeof data.baseUrl !== 'string') {
          return { status: 'invalid', reason: 'falta el campo "baseUrl"' };
        }

        return { status: 'loaded', config: { baseUrl: normalizeBaseUrl(data.baseUrl) } };
      } catch (error) {
        return {
          status: 'invalid',
          reason: error instanceof Error ? error.message : 'el contenido no es válido',
        };
      }
    },

    save(config: AppConfig): void {
      writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
    },
  };
}

export function createConfigService(store: ConfigStore, initial: AppConfig): ConfigService {
  let current = initial;

  return {
    filePath: store.filePath,
    getBaseUrl: () => current.baseUrl,
    setBaseUrl(input: string): AppConfig {
      const config: AppConfig = { baseUrl: normalizeBaseUrl(input) };
      store.save(config);
      current = config;
      return config;
    },
  };
}
