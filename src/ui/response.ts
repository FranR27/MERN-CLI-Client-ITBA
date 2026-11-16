import type { HttpFailure, HttpResponseData } from '../http/types.js';
import { isRecord } from '../utils/types.js';
import { colorForStatus, jsonColors, symbols, theme } from './theme.js';

const JSON_TOKEN =
  /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

/** Resalta claves, textos, números y literales de un JSON ya indentado. */
export function highlightJson(text: string): string {
  return text.replace(JSON_TOKEN, (match, stringToken, colon, literal) => {
    if (stringToken) {
      return colon
        ? `${jsonColors.key(stringToken)}${colon}`
        : jsonColors.string(stringToken);
    }

    if (literal) {
      return literal === 'null' ? theme.muted(literal) : jsonColors.literal(literal);
    }

    return jsonColors.number(match);
  });
}

export function formatResponse(response: HttpResponseData): string {
  const status = `${response.status} ${response.statusText}`.trim();
  const lines = [
    `${theme.accent(response.method)} ${theme.muted(response.url)}`,
    `${colorForStatus(response.status, status)} ${theme.muted(`· ${response.durationMs} ms`)}`,
    '',
  ];

  if (response.parseError) {
    lines.push(theme.warning(response.parseError), response.bodyText);
  } else if (response.bodyText.trim() === '') {
    lines.push(theme.muted('(sin contenido)'));
  } else {
    lines.push(highlightJson(JSON.stringify(response.body, null, 2)));
  }

  if (isRecord(response.body) && isRecord(response.body.error)) {
    const { codigo, mensaje } = response.body.error;
    const code = typeof codigo === 'string' ? theme.muted(` (${codigo})`) : '';

    if (typeof mensaje === 'string') {
      lines.push('', `${theme.danger('Error:')} ${mensaje}${code}`);
    }
  }

  return lines.join('\n');
}

export function formatFailure(failure: HttpFailure): string {
  const lines = [`${symbols.cross} ${theme.danger(failure.message)}`];

  if (failure.detail) {
    lines.push(theme.muted(failure.detail));
  }

  lines.push(theme.muted(`${failure.method} ${failure.url}`));

  return lines.join('\n');
}
