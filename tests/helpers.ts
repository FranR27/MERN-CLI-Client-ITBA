import assert from 'node:assert/strict';
import type { ActionContext } from '../src/actions/types.js';
import { DEFAULT_BASE_URL, type ConfigService } from '../src/config/config.js';
import type { HistoryEntry, HistoryStore } from '../src/history/history.js';
import type { HttpClient } from '../src/http/client.js';
import type {
  HttpFailure,
  HttpRequest,
  HttpResult,
  HttpResponseData,
} from '../src/http/types.js';
import { formatFailure, formatResponse } from '../src/ui/response.js';
import type { PromptService } from '../src/ui/prompts.js';
import type { UiService } from '../src/ui/ui.js';

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

export function makeResponse(
  overrides: Partial<HttpResponseData> = {},
): HttpResponseData {
  return {
    method: 'GET',
    url: 'http://localhost:3001/api/health',
    status: 200,
    statusText: 'OK',
    durationMs: 12,
    bodyText: '{}',
    body: {},
    ...overrides,
  };
}

export function okResponse(overrides: Partial<HttpResponseData> = {}): HttpResult {
  return { ok: true, response: makeResponse(overrides) };
}

export function failedRequest(
  overrides: Partial<HttpFailure> = {},
): HttpResult {
  return {
    ok: false,
    failure: {
      kind: 'connection',
      method: 'GET',
      url: 'http://localhost:3001/api/health',
      durationMs: 5,
      message: 'No se pudo conectar con la API.',
      ...overrides,
    },
  };
}

export interface FakeContextOptions {
  inputs?: string[];
  selects?: string[];
  confirms?: boolean[];
  results?: HttpResult[];
  history?: HistoryEntry[];
  baseUrl?: string;
  onSetBaseUrl?: (value: string) => void;
}

export interface FakeContext {
  context: ActionContext;
  printed: string[];
  requests: HttpRequest[];
  responses: HttpResponseData[];
  failures: HttpFailure[];
  historyEntries: HistoryEntry[];
}

/** Contexto con prompts y HTTP simulados para probar las acciones sin TTY ni red. */
export function createFakeContext(options: FakeContextOptions = {}): FakeContext {
  const printed: string[] = [];
  const requests: HttpRequest[] = [];
  const responses: HttpResponseData[] = [];
  const failures: HttpFailure[] = [];
  const historyEntries = [...(options.history ?? [])];
  const inputs = [...(options.inputs ?? [])];
  const selects = [...(options.selects ?? [])];
  const confirms = [...(options.confirms ?? [])];
  const results = [...(options.results ?? [])];
  let baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

  const prompt: PromptService = {
    input: async (promptOptions) => {
      const value = inputs.shift();
      assert.ok(value !== undefined, `Falta una respuesta para: ${promptOptions.message}`);
      return value;
    },

    select: async <Value extends string>(): Promise<Value> => {
      const value = selects.shift();
      assert.ok(value !== undefined, 'Falta una respuesta de selección');
      return value as Value;
    },

    confirm: async (promptOptions) => {
      const value = confirms.shift();
      assert.ok(value !== undefined, `Falta una respuesta para: ${promptOptions.message}`);
      return value;
    },
  };

  const http: HttpClient = {
    request: async (request) => {
      requests.push(request);
      const result = results.shift();
      assert.ok(result, `Falta un resultado HTTP para ${request.method} ${request.path}`);
      return result;
    },
  };

  const history: HistoryStore = {
    filePath: '/tmp/.mern-cli-history.json',
    list: () => historyEntries.map((entry) => ({ ...entry })),
    add: (entry) => {
      historyEntries.unshift(entry);
    },
  };

  const config: ConfigService = {
    filePath: '/tmp/.mern-cli.json',
    getBaseUrl: () => baseUrl,
    setBaseUrl: (value) => {
      options.onSetBaseUrl?.(value);
      baseUrl = value;
      return { baseUrl };
    },
  };

  const ui: UiService = {
    runWithSpinner: async (_label, task) => task(),
    showResponse: (response) => {
      responses.push(response);
      printed.push(formatResponse(response));
    },
    showFailure: (failure) => {
      failures.push(failure);
      printed.push(formatFailure(failure));
    },
  };

  return {
    context: {
      print: (message) => printed.push(message),
      prompt,
      config,
      http,
      history,
      ui,
    },
    printed,
    requests,
    responses,
    failures,
    historyEntries,
  };
}
