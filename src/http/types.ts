export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const HTTP_METHODS: readonly HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  body?: unknown;
}

export interface HttpResponseData {
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  durationMs: number;
  bodyText: string;
  body?: unknown;
  parseError?: string;
}

export type HttpFailureKind = 'connection' | 'timeout' | 'invalid-request';

export interface HttpFailure {
  kind: HttpFailureKind;
  method: HttpMethod;
  url: string;
  durationMs: number;
  message: string;
  detail?: string;
}

export type HttpResult =
  | { ok: true; response: HttpResponseData }
  | { ok: false; failure: HttpFailure };

export function isHttpMethod(value: unknown): value is HttpMethod {
  return typeof value === 'string' && (HTTP_METHODS as readonly string[]).includes(value);
}
