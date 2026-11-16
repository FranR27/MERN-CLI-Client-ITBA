import type { ActionContext } from './actions/types.js';
import {
  createConfigService,
  createConfigStore,
  type ConfigStore,
} from './config/config.js';
import { createHistoryStore, type HistoryStore } from './history/history.js';
import { createHttpClient } from './http/client.js';
import { resolveConfig } from './startup.js';
import { promptService, type PromptService } from './ui/prompts.js';
import type { SpinnerService } from './ui/spinner.js';
import { createUiService } from './ui/ui.js';
import type { PrintFunction } from './utils/print.js';

export interface CreateAppContextDependencies {
  directory?: string;
  store?: ConfigStore;
  history?: HistoryStore;
  prompt?: PromptService;
  print?: PrintFunction;
  fetchImpl?: typeof fetch;
  spinner?: SpinnerService;
}

/** Compone la configuración, el cliente HTTP, el historial y la interfaz. */
export async function createAppContext(
  dependencies: CreateAppContextDependencies = {},
): Promise<ActionContext> {
  const print = dependencies.print ?? ((message: string) => console.log(message));
  const prompt = dependencies.prompt ?? promptService;

  const { store, config: initialConfig } = await resolveConfig({
    store: dependencies.store ?? createConfigStore(dependencies.directory),
    prompt,
    print,
  });

  const config = createConfigService(store, initialConfig);
  const http = createHttpClient({
    getBaseUrl: () => config.getBaseUrl(),
    ...(dependencies.fetchImpl ? { fetchImpl: dependencies.fetchImpl } : {}),
  });

  return {
    print,
    prompt,
    config,
    http,
    history: dependencies.history ?? createHistoryStore(dependencies.directory),
    ui: createUiService(print, dependencies.spinner),
  };
}
