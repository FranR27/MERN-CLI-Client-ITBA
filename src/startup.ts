import {
  CONFIG_FILE_NAME,
  DEFAULT_BASE_URL,
  createConfigStore,
  normalizeBaseUrl,
  validateBaseUrl,
  type AppConfig,
  type ConfigStore,
} from './config/config.js';
import { promptService, type PromptService } from './ui/prompts.js';
import { theme } from './ui/theme.js';
import type { PrintFunction } from './utils/print.js';

export interface ResolveConfigDependencies {
  directory?: string;
  store?: ConfigStore;
  prompt?: PromptService;
  print?: PrintFunction;
}

export interface ResolvedConfig {
  store: ConfigStore;
  config: AppConfig;
}

/**
 * Carga la configuración local o solicita la URL base si no existe.
 * Si el archivo es inválido, avisa y vuelve a pedir la URL.
 */
export async function resolveConfig(
  dependencies: ResolveConfigDependencies = {},
): Promise<ResolvedConfig> {
  const print = dependencies.print ?? ((message: string) => console.log(message));
  const prompt = dependencies.prompt ?? promptService;
  const store = dependencies.store ?? createConfigStore(dependencies.directory);

  const loaded = store.load();

  if (loaded.status === 'loaded') {
    return { store, config: loaded.config };
  }

  if (loaded.status === 'invalid') {
    print(theme.warning(`No se pudo usar ${CONFIG_FILE_NAME}: ${loaded.reason}.`));
  }

  const answer = await prompt.input({
    message: 'URL base de la API',
    default: DEFAULT_BASE_URL,
    validate: validateBaseUrl,
  });

  const config: AppConfig = { baseUrl: normalizeBaseUrl(answer) };

  try {
    store.save(config);
    print(theme.muted(`Configuración guardada en ${CONFIG_FILE_NAME}.`));
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'error desconocido';
    print(theme.warning(`No se pudo guardar ${CONFIG_FILE_NAME}: ${detail}`));
  }

  return { store, config };
}
