import type {
  HttpMethod,
  HttpRequest,
  HttpResult,
  HttpResponseData,
} from './types.js';

export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResult>;
}

export interface HttpClientOptions {
  getBaseUrl: () => string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/** Convierte una ruta relativa en una ruta con barra inicial. */
export function normalizeRelativePath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed) {
    throw new Error('La ruta no puede estar vacía.');
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    throw new Error('La ruta debe ser relativa a la URL base.');
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Une la URL base con la ruta relativa sin duplicar barras. */
export function buildUrl(baseUrl: string, path: string): string {
  const relativePath = normalizeRelativePath(path);

  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    throw new Error('La URL base configurada no es válida.');
  }

  if (base.protocol !== 'http:' && base.protocol !== 'https:') {
    throw new Error('La URL base debe usar http o https.');
  }

  const basePath = base.pathname.replace(/\/+$/, '');
  const url = new URL(`${base.origin}${basePath}${relativePath}`);

  // URL normaliza segmentos "." y "..", incluidos sus equivalentes codificados.
  // Rechazamos cualquier ruta que salga del prefijo de API configurado.
  const prefix = basePath || '';
  if (url.origin !== base.origin || (prefix !== '' && url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`))) {
    throw new Error('La ruta no puede salir del prefijo de la API configurado.');
  }

  return url.toString();
}

function technicalDetail(error: unknown): string | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }

  if (error.cause instanceof Error && error.cause.message) {
    return `${error.message}: ${error.cause.message}`;
  }

  return error.message;
}

function failure(
  kind: 'connection' | 'timeout' | 'invalid-request',
  method: HttpMethod,
  url: string,
  message: string,
  durationMs: number,
  detail?: string,
): HttpResult {
  return {
    ok: false,
    failure: { kind, method, url, message, durationMs, ...(detail ? { detail } : {}) },
  };
}

/**
 * Cliente HTTP mínimo sobre `fetch`.
 * No lanza por errores de red: devuelve un resultado tipado para que la TUI decida qué mostrar.
 */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  const { getBaseUrl, timeoutMs = 10_000, fetchImpl = fetch } = options;

  return {
    async request(request: HttpRequest): Promise<HttpResult> {
      let url: string;
      try {
        url = buildUrl(getBaseUrl(), request.path);
      } catch (error) {
        return failure(
          'invalid-request',
          request.method,
          request.path,
          error instanceof Error ? error.message : 'La petición no es válida.',
          0,
        );
      }

      const startedAt = performance.now();
      const controller = new AbortController();
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        let body: string | undefined;

        if (request.body !== undefined) {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(request.body);
        }

        const response = await fetchImpl(url, {
          method: request.method,
          headers,
          body,
          signal: controller.signal,
        });

        const bodyText = await response.text();
        const durationMs = Math.round(performance.now() - startedAt);
        let parsedBody: unknown;
        let parseError: string | undefined;

        if (bodyText.trim() !== '') {
          try {
            parsedBody = JSON.parse(bodyText);
          } catch {
            parseError = 'La respuesta no es JSON válido. Se muestra el texto recibido.';
          }
        }

        const responseData: HttpResponseData = {
          method: request.method,
          url,
          status: response.status,
          statusText: response.statusText,
          durationMs,
          bodyText,
          ...(parsedBody !== undefined ? { body: parsedBody } : {}),
          ...(parseError ? { parseError } : {}),
        };

        return { ok: true, response: responseData };
      } catch (error) {
        const durationMs = Math.round(performance.now() - startedAt);

        if (timedOut) {
          return failure(
            'timeout',
            request.method,
            url,
            `La petición superó el tiempo máximo de espera (${timeoutMs} ms).`,
            durationMs,
          );
        }

        return failure(
          'connection',
          request.method,
          url,
          'No se pudo conectar con la API. Verificá que el backend esté en ejecución.',
          durationMs,
          technicalDetail(error),
        );
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
